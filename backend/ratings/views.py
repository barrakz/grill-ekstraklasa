from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Rating
from .serializers import RatingSerializer
from players.models import Player
from .utils import check_rating_throttle, recalculate_player_ratings

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset().exclude(player__club__name="Loan")
        player_id = self.request.query_params.get('player', None)
        
        if player_id:
            queryset = queryset.filter(player_id=player_id)
        
        # Filtrowanie po zalogowanym użytkowniku, gdy potrzebne
        user_only = self.request.query_params.get('user_only', False)
        if user_only and user_only.lower() == 'true':
            queryset = queryset.filter(user=self.request.user)
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Sprawdź czy użytkownik może dodać nową ocenę używając funkcji pomocniczej
        can_rate, error_message = check_rating_throttle(request.user)
        if not can_rate:
            return Response(
                {"detail": error_message},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"X-Error-Type": "throttled"}
            )
        
        # Block Loan players (they can exist in DB, but must not be visible/rateable publicly).
        player_id = request.data.get("player")
        if player_id:
            try:
                player = Player.objects.select_related("club").get(pk=player_id)
                if player.club and player.club.name == "Loan":
                    return Response(
                        {"detail": "Nie można oceniać zawodników z klubu Loan."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except Player.DoesNotExist:
                pass

        # Zawsze tworzymy nową ocenę, gdy użytkownik ocenia piłkarza
        serializer = self.get_serializer(data=request.data)
            
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def recalculate(self, request):
        """
        Endpoint dla administratorów do przeliczenia średnich ocen dla wszystkich lub wybranego piłkarza.
        """
        player_id = request.data.get('player_id', None)
        recalculate_player_ratings(player_id)
        
        return Response({
            "status": "success",
            "message": f"Rating recalculation {'for player ' + str(player_id) if player_id else 'for all players'} completed."
        }, status=status.HTTP_200_OK)
