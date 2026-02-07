from datetime import datetime
from comments.models import Comment
from comments.serializers import CommentSerializer
from core.pagination import StandardResultsSetPagination
from django.db.models import Case, When
from django.http import Http404
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from django_filters import rest_framework as filters
from ratings.models import Rating
from ratings.serializers import RatingSerializer
from ratings.utils import check_rating_throttle
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from core.ai import generate_comment_response

from .models import Player, PlayerMedia
from .serializers import PlayerSerializer


class PlayerFilter(filters.FilterSet):
    club = filters.NumberFilter(field_name="club__id")
    position = filters.CharFilter(lookup_expr="iexact")
    name = filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Player
        fields = ["club", "position", "name"]


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.exclude(club__name="Loan")
    serializer_class = PlayerSerializer
    filterset_class = PlayerFilter
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    lookup_field = "pk"  # Domyślnie wyszukujemy po pk
    lookup_value_regex = "[^/]+"  # Pozwala na dopasowanie zarówno ID jak i slugów

    def get_object(self):
        """
        Pozwala na wyszukiwanie zarówno po ID jak i po slugu.
        """
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        # Jeśli wartość to liczba, szukamy po ID
        if lookup_value.isdigit():
            obj = queryset.filter(pk=lookup_value).first()
        else:
            # W przeciwnym razie szukamy po slugu
            obj = queryset.filter(slug=lookup_value).first()

        # Jeśli nie znaleziono obiektu, podnosimy 404
        if obj is None:
            raise Http404("Nie znaleziono zawodnika o podanym identyfikatorze.")

        # Sprawdzamy uprawnienia
        self.check_object_permissions(self.request, obj)

        return obj

    def get_queryset(self):
        queryset = super().get_queryset().select_related("club")
        # If filtering by club, order by position in the sequence: GK, DF, MF, FW
        if "club" in self.request.query_params:
            position_order = Case(
                When(position="GK", then=1),
                When(position="DF", then=2),
                When(position="MF", then=3),
                When(position="FW", then=4),
                default=5,
            )
            queryset = queryset.order_by(position_order, "name")
        else:
            # For all players view (no club filter), sort by average rating from highest to lowest
            queryset = queryset.order_by("-average_rating")
        return queryset

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        player = self.get_object()

        # Sprawdź czy użytkownik może dodać nową ocenę używając funkcji pomocniczej
        can_rate, error_message = check_rating_throttle(request.user)
        if not can_rate:
            return Response(
                {"detail": error_message},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"X-Error-Type": "throttled"},
            )

        # Jawnie ustawiamy player_id w danych wejściowych
        data = {
            "player": player.id,  # Używamy ID zawodnika, niezależnie czy URL zawiera ID czy slug
            "value": request.data.get("value"),
        }

        serializer = RatingSerializer(data=data, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        player = self.get_object()

        # Sprawdź czy użytkownik może dodać nowy komentarz
        from ratings.utils import check_comment_throttle

        can_comment, error_message = check_comment_throttle(request.user)
        if not can_comment:
            return Response(
                {"detail": error_message},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"X-Error-Type": "throttled"},
            )

        # Jawnie ustawiamy player_id w danych wejściowych
        data = {
            "player_id": player.id,  # Używamy ID zawodnika, niezależnie czy URL zawiera ID czy slug
            "content": request.data.get("content"),
        }

        serializer = CommentSerializer(data=data, context={"request": request})

        if serializer.is_valid():
            # Generate AI response
            user_comment = request.data.get("content")
            
            ai_text = generate_comment_response(
                user_comment=user_comment,
                player_name=player.name,
                user_name=request.user.username
            )
            
            serializer.save(user=request.user, ai_response=ai_text)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def top_rated(self, request):
        """
        Zwraca listę najlepiej ocenianych piłkarzy.
        Parametry query:
        - limit: liczba piłkarzy do zwrócenia (domyślnie 5)
        - min_ratings: minimalna liczba ocen (domyślnie 3)
        """
        limit = int(request.query_params.get("limit", 5))
        min_ratings = int(request.query_params.get("min_ratings", 3))

        # Pobierz piłkarzy z minimalną liczbą ocen i posortuj wg średniej
        players = Player.objects.filter(total_ratings__gte=min_ratings).order_by(
            "-average_rating", "name"
        )[:limit]

        serializer = self.get_serializer(players, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
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
        sort_by = request.query_params.get("sort_by", "-created_at")
        # Walidacja poprawności pola sortowania
        valid_sort_fields = ["-created_at", "created_at", "-likes_count", "likes_count"]
        if sort_by not in valid_sort_fields:
            sort_by = "-created_at"  # Domyślne sortowanie, jeśli nieprawidłowe pole

        # Sortowanie po liczbie polubień wymaga dodatkowej logiki
        if "likes_count" in sort_by:
            # Musimy użyć annotate, aby móc sortować po liczbie polubień
            from django.db.models import Count

            prefix = "-" if sort_by.startswith("-") else ""
            comments = (
                Comment.objects.filter(player=player)
                .annotate(likes_count_val=Count("likes"))
                .order_by(f"{prefix}likes_count_val", "-created_at")
            )  # dodajemy created_at jako drugorzędne sortowanie
        else:
            comments = Comment.objects.filter(player=player).order_by(sort_by)

        # Utwórz instancję paginatora
        paginator = StandardResultsSetPagination()
        paginated_comments = paginator.paginate_queryset(comments, request)

        # Serializuj wyniki
        serializer = CommentSerializer(
            paginated_comments, many=True, context={"request": request}
        )

        # Zwróć spaginowany wynik
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=["get", "post", "delete"])
    def media(self, request, pk=None):
        """
        Manage player's media (GIFs and Tweets) with per-item timestamps.

        GET: list media
        POST: add media (url or gif file)
        DELETE: delete media by id or url
        """
        player = self.get_object()

        if request.method == "GET":
            items = (
                PlayerMedia.objects.filter(player=player)
                .order_by("-created_at")
                .values("id", "media_type", "url", "created_at")
            )
            return Response({"items": list(items)})

        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        def infer_media_type(url: str | None):
            if not url:
                return None
            lowered = url.lower()
            if "/status/" in lowered or "twitter.com" in lowered or "x.com" in lowered:
                return PlayerMedia.MEDIA_TWEET
            if lowered.endswith(".gif") or "giphy.com" in lowered:
                return PlayerMedia.MEDIA_GIF
            return None

        def parse_created_at(value: str | None):
            if not value:
                return timezone.now()
            dt = parse_datetime(value)
            if dt:
                return timezone.make_aware(dt) if timezone.is_naive(dt) else dt
            d = parse_date(value)
            if d:
                tz = timezone.get_current_timezone()
                return timezone.make_aware(datetime.combine(d, datetime.min.time()), tz)
            # Last resort: now
            return timezone.now()

        if request.method == "DELETE":
            media_id = request.data.get("id") if isinstance(request.data, dict) else None
            url = request.data.get("url") if isinstance(request.data, dict) else None

            qs = PlayerMedia.objects.filter(player=player)
            if media_id:
                qs = qs.filter(id=media_id)
            elif url:
                qs = qs.filter(url=url)
            else:
                return Response({"detail": "Provide 'id' or 'url'."}, status=status.HTTP_400_BAD_REQUEST)

            deleted, _ = qs.delete()
            if deleted == 0:
                return Response({"detail": "Media not found."}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        # POST
        upload_gif = request.FILES.get("gif")
        url = request.data.get("url")
        media_type = request.data.get("media_type") or request.data.get("type")
        created_at = parse_created_at(request.data.get("created_at"))

        if upload_gif:
            # Validate file
            if not upload_gif.name.lower().endswith(".gif"):
                return Response({"detail": "Plik musi być w formacie GIF"}, status=status.HTTP_400_BAD_REQUEST)
            if upload_gif.size > 25 * 1024 * 1024:
                return Response({"detail": "Plik jest za duży. Maksymalny rozmiar to 25MB"}, status=status.HTTP_400_BAD_REQUEST)

            from django.core.files.base import ContentFile
            from django.core.files.storage import default_storage

            timestamp = created_at.astimezone(timezone.get_current_timezone()).strftime("%Y%m%d_%H%M%S")
            filename = f"players/gifs/{player.slug}_{timestamp}.gif"
            path = default_storage.save(filename, ContentFile(upload_gif.read()))
            url = default_storage.url(path)
            media_type = PlayerMedia.MEDIA_GIF
        else:
            if not url:
                return Response({"detail": "Podaj 'url' albo wgraj plik GIF w polu 'gif'."}, status=status.HTTP_400_BAD_REQUEST)
            if not media_type:
                media_type = infer_media_type(url)
            if media_type not in (PlayerMedia.MEDIA_GIF, PlayerMedia.MEDIA_TWEET):
                return Response({"detail": "Nieprawidłowy media_type (gif/tweet)."}, status=status.HTTP_400_BAD_REQUEST)

        media = PlayerMedia.objects.create(
            player=player,
            media_type=media_type,
            url=url,
            created_at=created_at,
        )

        gif_urls = list(
            PlayerMedia.objects.filter(player=player, media_type=PlayerMedia.MEDIA_GIF)
            .order_by("-created_at")
            .values_list("url", flat=True)
        )
        tweet_urls = list(
            PlayerMedia.objects.filter(player=player, media_type=PlayerMedia.MEDIA_TWEET)
            .order_by("-created_at")
            .values_list("url", flat=True)
        )

        return Response(
            {
                "media": {
                    "id": media.id,
                    "media_type": media.media_type,
                    "url": media.url,
                    "created_at": media.created_at,
                },
                # Convenience: return updated lists for legacy clients.
                "gif_urls": gif_urls,
                "tweet_urls": tweet_urls,
            },
            status=status.HTTP_201_CREATED,
        )
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def upload_gif(self, request, pk=None):
        """
        Upload GIF file for a player. Only authenticated users can upload.
        The GIF will be stored and its URL added to the player's gif_urls list.
        """
        player = self.get_object()
        
        if 'gif' not in request.FILES:
            return Response(
                {"detail": "Brak pliku GIF"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gif_file = request.FILES['gif']
        
        # Validate file type
        if not gif_file.name.lower().endswith('.gif'):
            return Response(
                {"detail": "Plik musi być w formacie GIF"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 25MB)
        if gif_file.size > 25 * 1024 * 1024:
            return Response(
                {"detail": "Plik jest za duży. Maksymalny rozmiar to 25MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Import necessary modules for file upload
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        import os
        from datetime import datetime
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"players/gifs/{player.slug}_{timestamp}.gif"
        
        # Save file
        path = default_storage.save(filename, ContentFile(gif_file.read()))
        gif_url = default_storage.url(path)
        
        # Add URL to player's gif_urls
        if player.gif_urls is None:
            player.gif_urls = []
        
        player.gif_urls.append(gif_url)
        player.save()

        PlayerMedia.objects.get_or_create(
            player=player,
            media_type=PlayerMedia.MEDIA_GIF,
            url=gif_url,
        )
        
        return Response({
            "detail": "GIF został dodany",
            "gif_url": gif_url,
            "gif_urls": player.gif_urls
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=["delete"], permission_classes=[permissions.IsAuthenticated])
    def delete_gif(self, request, pk=None):
        """
        Delete a specific GIF from player's gif_urls list.
        Requires 'gif_url' in request data.
        """
        player = self.get_object()
        gif_url = request.data.get('gif_url')
        
        if not gif_url:
            return Response(
                {"detail": "Brak URL GIFa do usunięcia"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if player.gif_urls is None or gif_url not in player.gif_urls:
            return Response(
                {"detail": "GIF nie został znaleziony"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Remove URL from list
        player.gif_urls.remove(gif_url)
        player.save()

        PlayerMedia.objects.filter(
            player=player,
            media_type=PlayerMedia.MEDIA_GIF,
            url=gif_url
        ).delete()
        
        # Optionally delete the file from storage
        from django.core.files.storage import default_storage
        try:
            # Extract path from URL
            if gif_url.startswith('http'):
                # For S3 URLs, extract the path after the bucket URL
                from urllib.parse import urlparse
                parsed = urlparse(gif_url)
                path = parsed.path.lstrip('/')
            else:
                path = gif_url
            
            if default_storage.exists(path):
                default_storage.delete(path)
        except Exception:
            # If deletion fails, continue anyway as the URL is removed from the list
            pass
        
        return Response({
            "detail": "GIF został usunięty",
            "gif_urls": player.gif_urls
        })
