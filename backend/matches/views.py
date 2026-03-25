from datetime import datetime

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Fixture, FixturePlayer, FixtureRating
from .serializers import FixtureDetailSerializer, FixtureListSerializer, FixturePublicDetailSerializer
from .services import (
    analyze_fixture_import,
    analyze_lineup_import,
    apply_manual_lineup,
    attach_full_squad,
    confirm_fixture_import,
    confirm_lineup_import,
    fixture_queryset_with_counts,
)

PUBLIC_FIXTURE_STATUSES = {
    Fixture.STATUS_LINEUP_PREDICTED,
    Fixture.STATUS_PUBLISHED,
    Fixture.STATUS_LIVE,
    Fixture.STATUS_FINISHED,
}


class FixtureUpcomingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = (
            fixture_queryset_with_counts()
            .filter(status__in=PUBLIC_FIXTURE_STATUSES)
            .filter(kickoff_at__gte=timezone.now())
            .order_by("kickoff_at")[:20]
        )
        serializer = FixtureListSerializer(queryset, many=True)
        return Response(serializer.data)


class FixtureListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = fixture_queryset_with_counts().filter(status__in=PUBLIC_FIXTURE_STATUSES)
        scope = request.query_params.get("scope", "upcoming")
        try:
            raw_limit = int(request.query_params.get("limit", 24))
        except (TypeError, ValueError):
            raw_limit = 24
        limit = min(max(raw_limit, 1), 100)
        now = timezone.now()

        if scope == "recent":
            queryset = queryset.filter(kickoff_at__lt=now).order_by("-kickoff_at")
        elif scope == "all":
            queryset = queryset.order_by("kickoff_at")
        else:
            queryset = queryset.filter(kickoff_at__gte=now).order_by("kickoff_at")

        serializer = FixtureListSerializer(queryset[:limit], many=True)
        return Response(serializer.data)


class FixtureDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        fixture = get_object_or_404(
            Fixture.objects.select_related("season", "round", "home_club", "away_club"),
            slug=slug,
            status__in=PUBLIC_FIXTURE_STATUSES,
        )
        serializer = FixturePublicDetailSerializer(fixture)
        return Response(serializer.data)


class FixtureRatingView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, slug):
        fixture = get_object_or_404(
            Fixture.objects.select_related("season", "round", "home_club", "away_club"),
            slug=slug,
            status__in=PUBLIC_FIXTURE_STATUSES,
        )
        fixture_player = get_object_or_404(
            FixturePlayer.objects.select_related("player", "fixture"),
            pk=request.data.get("fixture_player_id"),
            fixture=fixture,
            is_visible_public=True,
        )

        try:
            value = int(request.data.get("value"))
        except (TypeError, ValueError):
            return Response({"detail": "Ocena musi być liczbą od 1 do 10."}, status=status.HTTP_400_BAD_REQUEST)

        if value < 1 or value > 10:
            return Response({"detail": "Ocena musi być liczbą od 1 do 10."}, status=status.HTTP_400_BAD_REQUEST)

        if request.user and request.user.is_authenticated:
            rating, _ = FixtureRating.objects.update_or_create(
                fixture=fixture,
                fixture_player=fixture_player,
                user=request.user,
                defaults={
                    "player": fixture_player.player,
                    "session_key": "",
                    "value": value,
                },
            )
        else:
            if not request.session.session_key:
                request.session.create()
            rating, _ = FixtureRating.objects.update_or_create(
                fixture=fixture,
                fixture_player=fixture_player,
                session_key=request.session.session_key,
                defaults={
                    "player": fixture_player.player,
                    "user": None,
                    "value": value,
                },
            )

        fixture.refresh_from_db()
        public_payload = FixturePublicDetailSerializer(fixture).data
        updated_player = None
        for side_entries in public_payload["lineup"].values():
            if not side_entries:
                continue
            for item in side_entries:
                if item["id"] == fixture_player.id:
                    updated_player = item
                    break
            if updated_player:
                break

        return Response(
            {
                "fixture_player_id": fixture_player.id,
                "value": rating.value,
                "player_summary": updated_player,
                "fixture_ratings_count": public_payload["ratings_count"],
                "home_rating_avg": public_payload["home_rating_avg"],
                "away_rating_avg": public_payload["away_rating_avg"],
            },
            status=status.HTTP_200_OK,
        )


class AdminFixtureListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        queryset = fixture_queryset_with_counts().order_by("kickoff_at", "id")
        status_value = request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        season_name = request.query_params.get("season")
        if season_name:
            queryset = queryset.filter(season__name=season_name)

        serializer = FixtureListSerializer(queryset[:200], many=True)
        return Response({"results": serializer.data})


class AdminFixtureDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, fixture_id):
        fixture = get_object_or_404(
            Fixture.objects.select_related("season", "round", "home_club", "away_club"),
            pk=fixture_id,
        )
        serializer = FixtureDetailSerializer(fixture)
        return Response(serializer.data)

    def patch(self, request, fixture_id):
        fixture = get_object_or_404(Fixture, pk=fixture_id)

        if "status" in request.data:
            fixture.status = request.data["status"]
        if "result_home" in request.data:
            fixture.result_home = request.data["result_home"]
        if "result_away" in request.data:
            fixture.result_away = request.data["result_away"]
        if "kickoff_at" in request.data:
            kickoff_at = datetime.fromisoformat(request.data["kickoff_at"])
            if timezone.is_naive(kickoff_at):
                kickoff_at = timezone.make_aware(kickoff_at, timezone.get_current_timezone())
            fixture.kickoff_at = kickoff_at

        fixture.save()
        return Response(FixtureDetailSerializer(fixture).data)


class AdminFixtureLineupUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, fixture_id):
        fixture = get_object_or_404(
            Fixture.objects.select_related("home_club", "away_club"),
            pk=fixture_id,
        )
        apply_manual_lineup(fixture, request.data or {})
        return Response(FixtureDetailSerializer(fixture).data)


class AdminFixtureImportAnalyzeView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        payload = request.data.get("payload")
        result = analyze_fixture_import(
            payload,
            default_timezone=request.data.get("timezone", "Europe/Warsaw"),
            default_season_name=request.data.get("season_name"),
        )
        return Response(result)


class AdminFixtureImportConfirmView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        result = confirm_fixture_import(
            request.data.get("entries", []),
            attach_full_squads_enabled=bool(request.data.get("attach_full_squads")),
        )
        return Response(result, status=status.HTTP_201_CREATED)


class AdminAttachFullSquadsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, fixture_id):
        fixture = get_object_or_404(Fixture, pk=fixture_id)
        attach_full_squad(fixture, overwrite=bool(request.data.get("overwrite")))
        return Response({"detail": "Pełne kadry zostały przypięte."})


class AdminLineupImportAnalyzeView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, fixture_id):
        fixture = get_object_or_404(
            Fixture.objects.select_related("season", "round", "home_club", "away_club"),
            pk=fixture_id,
        )
        result = analyze_lineup_import(fixture, request.data.get("payload"))
        return Response(result)


class AdminLineupImportConfirmView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, fixture_id):
        fixture = get_object_or_404(Fixture, pk=fixture_id)
        result = confirm_lineup_import(
            fixture,
            request.data.get("entries", []),
            raw_payload=request.data.get("payload"),
        )
        return Response(result, status=status.HTTP_201_CREATED)
