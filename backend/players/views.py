from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters import rest_framework as filters
from .models import Player
from ratings.models import Rating
from comments.models import Comment
from comments.serializers import CommentSerializer
from .serializers import PlayerSerializer
from ratings.serializers import RatingSerializer
from ratings.utils import check_rating_throttle


class PlayerFilter(filters.FilterSet):
    club = filters.NumberFilter(field_name='club__id')
    position = filters.CharFilter(lookup_expr='iexact')
    name = filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Player
        fields = ['club', 'position', 'name']

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filterset_class = PlayerFilter
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        player = self.get_object()
        
        # Sprawdź czy użytkownik może dodać nową ocenę używając funkcji pomocniczej
        can_rate, error_response = check_rating_throttle(request.user)
        if not can_rate:
            return error_response

        serializer = RatingSerializer(
            data={'player': player.id, 'value': request.data.get('value')},
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        player = self.get_object()
        serializer = CommentSerializer(
            data={'player': player.id, 'content': request.data.get('content')},
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
