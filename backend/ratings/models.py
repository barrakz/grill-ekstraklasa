from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
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
