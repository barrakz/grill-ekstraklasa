from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from players.models import Player

class Rating(models.Model):
    # Dodajemy db_index=True do pola player, ponieważ będziemy często filtrować po piłkarzach
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='ratings', db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_ratings')
    value = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # Dodajemy indeks dla pola player z datą utworzenia,
        # co przyspieszy zapytania filtrujące po zawodniku i sortujące po dacie
        indexes = [
            models.Index(fields=['player', '-created_at'], name='player_date_idx'),
        ]

    def __str__(self):
        return f"{self.user.username} rated {self.player.name}: {self.value}"

# Sygnały do aktualizacji średniej ocen piłkarza
@receiver(post_save, sender=Rating)
def update_player_rating_on_save(sender, instance, **kwargs):
    """
    Aktualizuje średnią ocen piłkarza po zapisaniu nowej oceny lub aktualizacji istniejącej
    """
    update_player_rating(instance.player)

@receiver(post_delete, sender=Rating)
def update_player_rating_on_delete(sender, instance, **kwargs):
    """
    Aktualizuje średnią ocen piłkarza po usunięciu oceny
    """
    update_player_rating(instance.player)

def update_player_rating(player):
    """
    Aktualizuje średnią ocen i liczbę ocen dla danego piłkarza
    """
    ratings = player.ratings.all()
    count = ratings.count()
    
    if count > 0:
        avg = sum(r.value for r in ratings) / count
    else:
        avg = 0
    
    # Aktualizujemy pola w modelu Player
    player.average_rating = avg
    player.total_ratings = count
    player.save(update_fields=['average_rating', 'total_ratings'])
