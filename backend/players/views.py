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
from core.pagination import StandardResultsSetPagination


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
        
    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """
        Zwraca listę najlepiej ocenianych piłkarzy.
        Parametry query:
        - limit: liczba piłkarzy do zwrócenia (domyślnie 5)
        - min_ratings: minimalna liczba ocen (domyślnie 3)
        """
        limit = int(request.query_params.get('limit', 5))
        min_ratings = int(request.query_params.get('min_ratings', 3))
        
        # Pobierz piłkarzy z minimalną liczbą ocen i posortuj wg średniej
        players = Player.objects.filter(
            total_ratings__gte=min_ratings
        ).order_by('-average_rating')[:limit]
        
        serializer = self.get_serializer(players, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """
        Zwraca listę komentarzy dla piłkarza z paginacją.
        Parametry query:
        - page: numer strony (domyślnie 1)
        - page_size: liczba komentarzy na stronę (domyślnie zgodnie z StandardResultsSetPagination)
        - sort_by: pole do sortowania (domyślnie '-created_at', opcje: 'created_at', 'likes_count')
        """
        player = self.get_object()
        
        # Określ pole sortowania
        sort_by = request.query_params.get('sort_by', '-created_at')
        # Walidacja poprawności pola sortowania
        valid_sort_fields = ['-created_at', 'created_at', '-likes_count', 'likes_count']
        if sort_by not in valid_sort_fields:
            sort_by = '-created_at'  # Domyślne sortowanie, jeśli nieprawidłowe pole
        
        # Sortowanie po liczbie polubień wymaga dodatkowej logiki
        if 'likes_count' in sort_by:
            # Musimy użyć annotate, aby móc sortować po liczbie polubień
            from django.db.models import Count
            prefix = '-' if sort_by.startswith('-') else ''
            comments = Comment.objects.filter(player=player)\
                .annotate(likes_count_val=Count('likes'))\
                .order_by(f'{prefix}likes_count_val', '-created_at')  # dodajemy created_at jako drugorzędne sortowanie
        else:
            comments = Comment.objects.filter(player=player).order_by(sort_by)
        
        # Utwórz instancję paginatora
        paginator = StandardResultsSetPagination()
        paginated_comments = paginator.paginate_queryset(comments, request)
        
        # Serializuj wyniki
        serializer = CommentSerializer(
            paginated_comments, 
            many=True,
            context={'request': request}
        )
        
        # Zwróć spaginowany wynik
        return paginator.get_paginated_response(serializer.data)
