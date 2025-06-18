from django.utils import timezone
from django.db.models import Avg, Count

def check_rating_throttle(user):
    """
    Sprawdza czy użytkownik może dodać nową ocenę (nie częściej niż raz na minutę).
    Zwraca (może_oceniać, wiadomość_o_błędzie)
    """
    from ratings.models import Rating
    
    last_rating = Rating.objects.filter(
        user=user
    ).order_by('-created_at').first()
    
    if last_rating and timezone.now() - last_rating.created_at < timezone.timedelta(minutes=1):
        return False, "Możesz oceniać tylko raz na minutę"
    
    return True, None

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
        
        avg_rating = rating_data['avg_rating'] or 0
        # Zaokrąglamy średnią do dwóch miejsc po przecinku
        player.average_rating = round(avg_rating, 2)
        player.total_ratings = rating_data['count'] or 0
        player.save(update_fields=['average_rating', 'total_ratings'])
        
    return True

def check_comment_throttle(user):
    """
    Sprawdza czy użytkownik może dodać nowy komentarz (nie częściej niż raz na minutę).
    Zwraca (możesz_komentować, wiadomość_o_błędzie)
    """
    from django.utils import timezone
    from comments.models import Comment
    
    last_comment = Comment.objects.filter(
        user=user
    ).order_by('-created_at').first()
    
    if last_comment and timezone.now() - last_comment.created_at < timezone.timedelta(minutes=1):
        return False, "Możesz komentować tylko raz na minutę"
    
    return True, None
