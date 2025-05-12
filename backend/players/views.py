from rest_framework import viewsets
from django_filters import rest_framework as filters

from .models import Player
from .serializers import PlayerSerializer


class PlayerFilter(filters.FilterSet):
    club = filters.NumberFilter(field_name='club__id')

    class Meta:
        model = Player
        fields = ['club']

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filterset_class = PlayerFilter
