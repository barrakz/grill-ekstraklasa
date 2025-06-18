from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Comment
from .serializers import CommentSerializer
from core.pagination import StandardResultsSetPagination
from rest_framework.filters import OrderingFilter
from ratings.utils import check_comment_throttle


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'likes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        player_id = self.request.query_params.get('player_id')
        if player_id:
            queryset = queryset.filter(player_id=player_id)
        return queryset

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        Endpoint do pobierania najnowszych komentarzy.
        Można określić limit komentarzy do pobrania za pomocą parametru 'limit' (domyślnie 5).
        """
        limit = int(request.query_params.get('limit', 5))
        latest_comments = self.get_queryset().select_related('user', 'player')[:limit]
        serializer = self.get_serializer(latest_comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        user = request.user
        
        if comment.likes.filter(id=user.id).exists():
            comment.likes.remove(user)
            action = 'unliked'
        else:
            comment.likes.add(user)
            action = 'liked'
        
        return Response({
            'status': f'Comment {action}',
            'likes_count': comment.likes_count
        })
    
    def create(self, request, *args, **kwargs):
        # Sprawdź czy użytkownik może dodać nowy komentarz
        can_comment, error_message = check_comment_throttle(request.user)
        if not can_comment:
            return Response(
                {"detail": error_message},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"X-Error-Type": "throttled"}
            )
        
        # Standardowa logika tworzenia komentarza
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
