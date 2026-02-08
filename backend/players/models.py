from django.db import models
from clubs.models import Club
from django.contrib.auth.models import User
from django.utils import timezone
import os

from django.db.models.signals import pre_delete, pre_save, post_save, post_delete
from django.dispatch import receiver
from django.utils.text import slugify
from django.core.files.base import ContentFile
from io import BytesIO
from PIL import Image, ImageOps


# Player model represents football players in the Ekstraklasa league
# Each player belongs to a specific club (ForeignKey relationship with Club model)
# The model stores basic information like name, position, and statistics
def player_photo_upload_to(instance, filename):
    _, ext = os.path.splitext(filename)
    ext = ext.lower() or ".jpg"
    # Keep a stable key per player to avoid leaving old photos behind.
    slug = instance.slug or slugify(instance.name or "player")
    return f"players/photos/{slug}{ext}"

def player_card_upload_to(instance, filename):
    _, ext = os.path.splitext(filename)
    ext = (ext or ".png").lower()
    # Stable key per player to overwrite on re-upload.
    slug = instance.slug or slugify(instance.name or "player")
    return f"players/cards/{slug}{ext}"


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
    # "Magic card" style portrait (expected 1024x1536 PNG, we downscale on upload).
    card_image = models.ImageField(upload_to=player_card_upload_to, null=True, blank=True)
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


class PlayerMedia(models.Model):
    MEDIA_GIF = "gif"
    MEDIA_TWEET = "tweet"

    MEDIA_CHOICES = [
        (MEDIA_GIF, "GIF"),
        (MEDIA_TWEET, "Tweet"),
    ]

    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=16, choices=MEDIA_CHOICES, db_index=True)
    url = models.URLField(max_length=500)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['player', '-created_at'], name='player_media_date_idx'),
        ]

    def __str__(self):
        return f"{self.player.name} - {self.media_type}"


@receiver([post_save, post_delete], sender=PlayerMedia)
def sync_player_media_lists(sender, instance, **kwargs):
    player = instance.player
    gif_urls = list(
        PlayerMedia.objects.filter(player=player, media_type=PlayerMedia.MEDIA_GIF)
        .order_by('-created_at')
        .values_list('url', flat=True)
    )
    tweet_urls = list(
        PlayerMedia.objects.filter(player=player, media_type=PlayerMedia.MEDIA_TWEET)
        .order_by('-created_at')
        .values_list('url', flat=True)
    )
    Player.objects.filter(pk=player.pk).update(gif_urls=gif_urls, tweet_urls=tweet_urls)

@receiver(pre_delete, sender=Player)
def delete_player_photo(sender, instance, **kwargs):
    # Delete the file from S3 if it exists
    if instance.photo:
        instance.photo.delete(save=False)
    if instance.card_image:
        instance.card_image.delete(save=False)


@receiver(pre_save, sender=Player)
def delete_player_photo_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = Player.objects.get(pk=instance.pk)
    except Player.DoesNotExist:
        return
    old_photo = old.photo
    old_card = old.card_image
    new_photo = instance.photo
    if old_photo and (not new_photo or old_photo.name != new_photo.name):
        old_photo.delete(save=False)
    new_card = instance.card_image
    if old_card and (not new_card or old_card.name != new_card.name):
        old_card.delete(save=False)


@receiver(pre_save, sender=Player)
def downscale_player_card_on_upload(sender, instance, **kwargs):
    """
    Downscale uploaded player card images to reduce storage/bandwidth.

    Expected input: 1024x1536 PNG. Output: 512x768 PNG.
    Only runs when a new file is assigned in this process (won't re-download from storage).
    """
    if not instance.card_image:
        return

    # If card_image wasn't newly assigned, FieldFile._file is typically missing/None.
    if not getattr(instance.card_image, "_file", None):
        return

    try:
        instance.card_image.file.seek(0)
        with Image.open(instance.card_image.file) as img:
            img = ImageOps.exif_transpose(img)

            target = (512, 768)
            w, h = img.size
            if h and abs((w / h) - (2 / 3)) < 0.02:
                img = img.resize(target, resample=Image.Resampling.LANCZOS)
            else:
                img = ImageOps.fit(img, target, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))

            # Preserve transparency if present; otherwise keep RGB.
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA")

            out = BytesIO()
            img.save(out, format="PNG", optimize=True, compress_level=9)
            out.seek(0)

        # Assign processed bytes back to field. upload_to will pick the final path.
        instance.card_image = ContentFile(out.read(), name="card.png")
    except Exception:
        # If processing fails, fall back to saving the original file.
        return
