from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Rating
from .serializers import RatingSerializer
from players.models import Player

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        player_id = self.request.query_params.get('player', None)
        
        if player_id:
            queryset = queryset.filter(player_id=player_id)
        
        # Filtrowanie po zalogowanym użytkowniku, gdy potrzebne
        user_only = self.request.query_params.get('user_only', False)
        if user_only and user_only.lower() == 'true':
            queryset = queryset.filter(user=self.request.user)
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Sprawdź czy użytkownik może dodać nową ocenę
        last_rating = Rating.objects.filter(
            user=request.user
        ).order_by('-created_at').first()
        
        if last_rating and timezone.now() - last_rating.created_at < timezone.timedelta(hours=1):
            return Response(
                {"error": "Can only rate once per hour"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
