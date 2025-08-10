from comments.models import Comment
from comments.serializers import CommentSerializer
from core.pagination import StandardResultsSetPagination
from django.db.models import Case, When
from django.http import Http404
from django.utils import timezone
from django_filters import rest_framework as filters
from ratings.models import Rating
from ratings.serializers import RatingSerializer
from ratings.utils import check_rating_throttle
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Player
from .serializers import PlayerSerializer


class PlayerFilter(filters.FilterSet):
    club = filters.NumberFilter(field_name="club__id")
    position = filters.CharFilter(lookup_expr="iexact")
    name = filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Player
        fields = ["club", "position", "name"]


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.exclude(club__name="Loan")
    serializer_class = PlayerSerializer
    filterset_class = PlayerFilter
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    lookup_field = "pk"  # Domyślnie wyszukujemy po pk
    lookup_value_regex = "[^/]+"  # Pozwala na dopasowanie zarówno ID jak i slugów

    def get_object(self):
        """
        Pozwala na wyszukiwanie zarówno po ID jak i po slugu.
        """
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        # Jeśli wartość to liczba, szukamy po ID
        if lookup_value.isdigit():
            obj = queryset.filter(pk=lookup_value).first()
        else:
            # W przeciwnym razie szukamy po slugu
            obj = queryset.filter(slug=lookup_value).first()

        # Jeśli nie znaleziono obiektu, podnosimy 404
        if obj is None:
            raise Http404("Nie znaleziono zawodnika o podanym identyfikatorze.")

        # Sprawdzamy uprawnienia
        self.check_object_permissions(self.request, obj)

        return obj

    def get_queryset(self):
        queryset = super().get_queryset().select_related("club")
        # If filtering by club, order by position in the sequence: GK, DF, MF, FW
        if "club" in self.request.query_params:
            position_order = Case(
                When(position="GK", then=1),
                When(position="DF", then=2),
                When(position="MF", then=3),
                When(position="FW", then=4),
                default=5,
            )
            queryset = queryset.order_by(position_order, "name")
        else:
            # For all players view (no club filter), sort by average rating from highest to lowest
            queryset = queryset.order_by("-average_rating")
        return queryset

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        player = self.get_object()

        # Sprawdź czy użytkownik może dodać nową ocenę używając funkcji pomocniczej
        can_rate, error_message = check_rating_throttle(request.user)
        if not can_rate:
            return Response(
                {"detail": error_message},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"X-Error-Type": "throttled"},
            )

        # Jawnie ustawiamy player_id w danych wejściowych
        data = {
            "player": player.id,  # Używamy ID zawodnika, niezależnie czy URL zawiera ID czy slug
            "value": request.data.get("value"),
        }

        serializer = RatingSerializer(data=data, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        from comments.ai import attach_ai_response

        player = self.get_object()
        from ratings.utils import check_comment_throttle

        can_comment, error_message = check_comment_throttle(request.user)
        if not can_comment:
            return Response(
                {"detail": error_message},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"X-Error-Type": "throttled"},
            )
        data = {
            "player_id": player.id,
            "content": request.data.get("content"),
        }
        serializer = CommentSerializer(data=data, context={"request": request})
        if serializer.is_valid():
            comment = serializer.save()
            try:
                attach_ai_response(comment)
            except Exception:
                pass
            refreshed = CommentSerializer(comment, context={"request": request})
            return Response(refreshed.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def top_rated(self, request):
        """
        Zwraca listę najlepiej ocenianych piłkarzy.
        Parametry query:
        - limit: liczba piłkarzy do zwrócenia (domyślnie 5)
        - min_ratings: minimalna liczba ocen (domyślnie 3)
        """
        limit = int(request.query_params.get("limit", 5))
        min_ratings = int(request.query_params.get("min_ratings", 3))

        # Pobierz piłkarzy z minimalną liczbą ocen i posortuj wg średniej
        players = Player.objects.filter(total_ratings__gte=min_ratings).order_by(
            "-average_rating"
        )[:limit]

        serializer = self.get_serializer(players, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        """
        Zwraca listę komentarzy dla piłkarza z paginacją.
        Parametry query:
        - page: numer strony (domyślnie 1)
        - page_size: liczba komentarzy na stronę (domyślnie zgodnie z StandardResultsSetPagination)
        - sort_by: pole do sortowania (domyślnie '-created_at', opcje: 'created_at', 'likes_count')
        """
        player = self.get_object()

        # Określ pole sortowania
        sort_by = request.query_params.get("sort_by", "-created_at")
        # Walidacja poprawności pola sortowania
        valid_sort_fields = ["-created_at", "created_at", "-likes_count", "likes_count"]
        if sort_by not in valid_sort_fields:
            sort_by = "-created_at"  # Domyślne sortowanie, jeśli nieprawidłowe pole

        # Sortowanie po liczbie polubień wymaga dodatkowej logiki
        if "likes_count" in sort_by:
            # Musimy użyć annotate, aby móc sortować po liczbie polubień
            from django.db.models import Count

            prefix = "-" if sort_by.startswith("-") else ""
            comments = (
                Comment.objects.filter(player=player)
                .annotate(likes_count_val=Count("likes"))
                .order_by(f"{prefix}likes_count_val", "-created_at")
            )  # dodajemy created_at jako drugorzędne sortowanie
        else:
            comments = Comment.objects.filter(player=player).order_by(sort_by)

        # Utwórz instancję paginatora
        paginator = StandardResultsSetPagination()
        paginated_comments = paginator.paginate_queryset(comments, request)

        # Serializuj wyniki
        serializer = CommentSerializer(
            paginated_comments, many=True, context={"request": request}
        )

        # Zwróć spaginowany wynik
        return paginator.get_paginated_response(serializer.data)
