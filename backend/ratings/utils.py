from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count

def check_rating_throttle(user):
    """
    Sprawdza czy użytkownik może dodać nową ocenę (nie częściej niż raz na godzinę).
    Zwraca (może_oceniać, odpowiedź_błędu)
    
    UWAGA: Ograniczenie tymczasowo wyłączone - każdy użytkownik może dodawać oceny bez limitu.
    """
    # Tymczasowo wyłączone ograniczenie na godzinę
    return True, None
    
    # Oryginalna implementacja z ograniczeniem - obecnie wyłączona
    """
    from ratings.models import Rating
    
    last_rating = Rating.objects.filter(
        user=user
    ).order_by('-created_at').first()
    
    if last_rating and timezone.now() - last_rating.created_at < timezone.timedelta(hours=1):
        return False, Response(
            {"error": "Can only rate once per hour"},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    return True, None
    """

def recalculate_player_ratings(player_id=None):
    """
    Przeliczyć średnie ocen dla wszystkich piłkarzy lub wybranego piłkarza.
    Użyteczne przy migracji danych lub naprawianiu niespójności.
    """
    from players.models import Player
    from ratings.models import Rating
    
    if player_id:
        players = Player.objects.filter(id=player_id)
    else:
        players = Player.objects.all()
    
    for player in players:
        # Pobieramy agregaty bezpośrednio z bazy danych
        rating_data = Rating.objects.filter(player=player).aggregate(
            avg_rating=Avg('value'),
            count=Count('id')
        )
        
        player.average_rating = rating_data['avg_rating'] or 0
        player.total_ratings = rating_data['count'] or 0
        player.save(update_fields=['average_rating', 'total_ratings'])
        
    return True
