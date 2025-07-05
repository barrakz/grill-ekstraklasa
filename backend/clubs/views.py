
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Club
from .serializers import ClubSerializer, ClubDetailSerializer

# Create your views here.


class ClubViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Club.objects.exclude(name='Loan')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClubDetailSerializer
        return ClubSerializer
