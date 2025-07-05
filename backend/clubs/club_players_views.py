from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Case, When
from players.models import Player
from players.serializers import PlayerSerializer
from .models import Club

class ClubPlayersViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing players belonging to a specific club.
    """
    serializer_class = PlayerSerializer

    def get_queryset(self):
        club_id = self.kwargs.get('club_pk')
        # Check if the club is "Loan" - if so, return empty queryset
        club = Club.objects.filter(id=club_id).first()
        if club and club.name == 'Loan':
            return Player.objects.none()
            
        # Order by position in the sequence: GK, DF, MF, FW, and then by name
        position_order = Case(
            When(position='GK', then=1),
            When(position='DF', then=2),
            When(position='MF', then=3),
            When(position='FW', then=4),
            default=5
        )
        return Player.objects.filter(club_id=club_id).order_by(position_order, 'name')
