from django.db import models
from clubs.models import Club
from django.contrib.auth.models import User


# Player model represents football players in the Ekstraklasa league
# Each player belongs to a specific club (ForeignKey relationship with Club model)
# The model stores basic information like name, position, and statistics
class Player(models.Model):
    POSITION_CHOICES = [
        ("GK", "Goalkeeper"),
        ("DF", "Defender"),
        ("MF", "Midfielder"),
        ("FW", "Forward"),
    ]

    name = models.CharField(max_length=100, db_index=True)  # Dodany indeks do wyszukiwania po nazwie
    position = models.CharField(max_length=2, choices=POSITION_CHOICES, db_index=True)  # Dodany indeks do filtrowania po pozycji
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, related_name='players', null=True, db_index=True)  # Dodany indeks do filtrowania po klubie
    nationality = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)  # in cm
    weight = models.IntegerField(null=True, blank=True)  # in kg
    photo = models.ImageField(upload_to='players/photos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    @property
    def rating_avg(self):
        ratings = self.ratings.all()
        if not ratings:
            return 0
        return sum(r.value for r in ratings) / len(ratings)

    @property
    def total_ratings(self):
        return self.ratings.count()

    def __str__(self):
        return f"{self.name} ({self.get_position_display()})"
    
    class Meta:
        ordering = ['name']
        indexes = [
            # Indeks złożony dla wyszukiwania zawodników po klubie i pozycji
            models.Index(fields=['club', 'position'], name='club_position_idx'),
        ]
