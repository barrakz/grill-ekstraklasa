from django.shortcuts import render
from rest_framework import viewsets

from .models import Club
from .serializers import ClubSerializer

# Create your views here.


class ClubViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
