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
        
        # Sprawdź czy użytkownik może dodać nową ocenę
        last_rating = Rating.objects.filter(
            user=request.user
        ).order_by('-created_at').first()
        
        if last_rating and timezone.now() - last_rating.created_at < timezone.timedelta(hours=1):
            return Response(
                {"error": "Can only rate once per hour"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

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
