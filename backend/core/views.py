from datetime import datetime, timedelta, time
from django.db.models import Avg, Count, Q
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.views import APIView
from players.models import Player, PlayerMedia
from comments.models import Comment


def home(request):
    """
    Widok główny API - przekierowuje do dokumentacji Swagger
    """
    return redirect('/api/swagger/')


@api_view(['GET'])
@permission_classes([AllowAny])
def weekly_dramas(request):
    limit = 3
    today = timezone.localdate()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=7)
    tz = timezone.get_current_timezone()
    start_dt = timezone.make_aware(datetime.combine(start_of_week, time.min), tz)
    end_dt = timezone.make_aware(datetime.combine(end_of_week, time.min), tz)

    ratings_filter = Q(ratings__created_at__gte=start_dt, ratings__created_at__lt=end_dt)

    rated_players = (
        Player.objects.filter(ratings_filter)
        .exclude(club__name="Loan")
        .select_related('club')
        .annotate(
            weekly_avg=Avg('ratings__value', filter=ratings_filter),
            weekly_count=Count('ratings', filter=ratings_filter),
        )
        .filter(weekly_count__gt=0)
        .order_by('weekly_avg', 'name')[:limit]
    )

    items = []
    rated_ids = [player.id for player in rated_players]

    def build_item(player, average_rating, total_ratings):
        latest_comment = (
            Comment.objects.filter(player=player, created_at__gte=start_dt, created_at__lt=end_dt)
            .select_related('user')
            .order_by('-created_at')
            .first()
        )
        if not latest_comment:
            latest_comment = (
                Comment.objects.filter(player=player)
                .select_related('user')
                .order_by('-created_at')
                .first()
            )

        latest_media = (
            PlayerMedia.objects.filter(player=player)
            .order_by('-created_at')
            .first()
        )

        items.append({
            "id": player.id,
            "player": {
                "id": player.id,
                "name": player.name,
                "slug": player.slug,
                "photo_url": player.photo.url if player.photo else None,
                "club_name": player.club.name if player.club else None,
                "club_logo_url": player.club.logo.url if player.club and player.club.logo else None,
            },
            "average_rating": round(average_rating or 0, 2),
            "total_ratings": total_ratings,
            "highlight_comment": None if not latest_comment else {
                "id": latest_comment.id,
                "content": latest_comment.content,
                "user": {
                    "username": latest_comment.user.username,
                } if latest_comment.user else None,
                "created_at": latest_comment.created_at,
            },
            "media": None if not latest_media else {
                "type": latest_media.media_type,
                "url": latest_media.url,
            },
        })

    for player in rated_players:
        build_item(player, player.weekly_avg, player.weekly_count)

    if len(items) < limit:
        fillers = (
            Player.objects.exclude(id__in=rated_ids)
            .exclude(club__name="Loan")
            .select_related('club')
            .order_by('name')[: limit - len(items)]
        )
        for player in fillers:
            build_item(player, 0, 0)

    week_number = start_of_week.isocalendar().week
    year_number = start_of_week.isocalendar().year

    return Response({
        "week_label": f"Tydzień {week_number}/{year_number}",
        "items": items,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def live_lowest_ratings(request):
    limit = 5
    rated_players = list(
        Player.objects.filter(total_ratings__gte=1)
        .exclude(club__name="Loan")
        .order_by('average_rating', 'name')[:limit]
    )
    rated_ids = [player.id for player in rated_players]

    items = [
        {
            "player_name": player.name,
            "player_slug": player.slug,
            "average_rating": player.average_rating,
            "total_ratings": player.total_ratings,
        }
        for player in rated_players
    ]

    if len(items) < limit:
        fillers = (
            Player.objects.exclude(id__in=rated_ids)
            .order_by('name')[: limit - len(items)]
        )
        for player in fillers:
            items.append({
                "player_name": player.name,
                "player_slug": player.slug,
                "average_rating": 0,
                "total_ratings": 0,
            })

    return Response({
        "updated_at": timezone.now(),
        "items": items,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def latest_media(request):
    media_items = (
        PlayerMedia.objects.select_related('player')
        .exclude(player__club__name="Loan")
        .order_by('-created_at')[:12]
    )

    return Response({
        "items": [
            {
                "id": media.id,
                "type": media.media_type,
                "url": media.url,
                "player_name": media.player.name,
                "player_slug": media.player.slug,
                "rating": media.player.average_rating,
            }
            for media in media_items
        ],
    })


# Klasa do obsługi logowania - zabezpieczona przed CSRF
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Wyłączamy uwierzytelnianie
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Both username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username
        })


# Użyjemy klasy APIView zamiast dekoratora api_view dla lepszej kontroli CSRF
class RegisterUserView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Pusta lista wyłącza uwierzytelnianie
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        if not username or not password:
            return Response(
                {'error': 'Both username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(username=username, password=password, email=email)
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username
        }, status=status.HTTP_201_CREATED)
