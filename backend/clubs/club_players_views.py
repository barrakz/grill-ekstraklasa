from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from players.models import Player
from players.serializers import PlayerSerializer

class ClubPlayersViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing players belonging to a specific club.
    """
    serializer_class = PlayerSerializer

    def get_queryset(self):
        club_id = self.kwargs.get('club_pk')
        return Player.objects.filter(club_id=club_id)
