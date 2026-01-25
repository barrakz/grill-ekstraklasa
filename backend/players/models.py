from django.db import models
from clubs.models import Club
from django.contrib.auth.models import User
import os

from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from django.utils.text import slugify


# Player model represents football players in the Ekstraklasa league
# Each player belongs to a specific club (ForeignKey relationship with Club model)
# The model stores basic information like name, position, and statistics
def player_photo_upload_to(instance, filename):
    _, ext = os.path.splitext(filename)
    ext = ext.lower() or ".jpg"
    # Keep a stable key per player to avoid leaving old photos behind.
    slug = instance.slug or slugify(instance.name or "player")
    return f"players/photos/{slug}{ext}"


class Player(models.Model):
    POSITION_CHOICES = [
        ("GK", "Goalkeeper"),
        ("DF", "Defender"),
        ("MF", "Midfielder"),
        ("FW", "Forward"),
    ]

    name = models.CharField(max_length=100, db_index=True)  # Dodany indeks do wyszukiwania po nazwie
    slug = models.SlugField(max_length=150, unique=True, null=True, blank=True)  # Pole dla SEO-friendly URL
    position = models.CharField(max_length=2, choices=POSITION_CHOICES, db_index=True)  # Dodany indeks do filtrowania po pozycji
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='players', null=True, db_index=True)  # Zmieniono na CASCADE - usunięcie klubu usuwa jego piłkarzy
    nationality = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)  # in cm
    weight = models.IntegerField(null=True, blank=True)  # in kg
    photo = models.ImageField(upload_to=player_photo_upload_to, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)  # Generated summary from Gemini
    tweet_urls = models.JSONField(null=True, blank=True, default=list)  # List of tweet URLs to display
    gif_urls = models.JSONField(null=True, blank=True, default=list)  # List of GIF URLs to display
    average_rating = models.FloatField(default=0)  # Przechowuje średnią ocen
    total_ratings = models.IntegerField(default=0)  # Przechowuje liczbę ocen
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def save(self, *args, **kwargs):
        # Generuj slug tylko jeśli nie istnieje
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)
    
    def _generate_unique_slug(self):
        """
        Generuje unikalny slug na podstawie imienia i nazwiska zawodnika.
        Jeśli slug już istnieje, dodaje numeryczny przyrostek.
        """
        base_slug = slugify(self.name)
        unique_slug = base_slug
        num = 1
        
        # Sprawdź czy slug jest unikalny
        while Player.objects.filter(slug=unique_slug).exists():
            unique_slug = f"{base_slug}-{num}"
            num += 1
            
        return unique_slug

    @property
    def rating_avg(self):
        # Utrzymujemy kompatybilność z istniejącym kodem
        return self.average_rating

    @property
    def total_ratings_count(self):
        # Utrzymujemy kompatybilność z istniejącym kodem
        return self.total_ratings

    def __str__(self):
        return f"{self.name} ({self.get_position_display()})"
    
    class Meta:
        ordering = ['name']
        indexes = [
            # Indeks złożony dla wyszukiwania zawodników po klubie i pozycji
            models.Index(fields=['club', 'position'], name='club_position_idx'),
        ]

@receiver(pre_delete, sender=Player)
def delete_player_photo(sender, instance, **kwargs):
    # Delete the file from S3 if it exists
    if instance.photo:
        instance.photo.delete(save=False)


@receiver(pre_save, sender=Player)
def delete_player_photo_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_photo = Player.objects.get(pk=instance.pk).photo
    except Player.DoesNotExist:
        return
    new_photo = instance.photo
    if old_photo and (not new_photo or old_photo.name != new_photo.name):
        old_photo.delete(save=False)
