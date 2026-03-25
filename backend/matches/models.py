from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils import timezone

from clubs.models import Club
from players.models import Player

from .utils import normalize_text, slugify_value


class Season(models.Model):
    name = models.CharField(max_length=32, unique=True)
    is_active = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_active", "-name"]

    def __str__(self):
        return self.name


class Round(models.Model):
    STATUS_UPCOMING = "upcoming"
    STATUS_LIVE = "live"
    STATUS_COMPLETED = "completed"

    STATUS_CHOICES = [
        (STATUS_UPCOMING, "Upcoming"),
        (STATUS_LIVE, "Live"),
        (STATUS_COMPLETED, "Completed"),
    ]

    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="rounds")
    number = models.PositiveIntegerField()
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_UPCOMING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["season__name", "number"]
        constraints = [
            models.UniqueConstraint(fields=["season", "number"], name="unique_round_per_season"),
        ]

    def __str__(self):
        return f"{self.season.name} / kolejka {self.number}"


class ClubAlias(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="club_aliases")
    alias = models.CharField(max_length=120)
    normalized_alias = models.CharField(max_length=120, db_index=True, editable=False)
    source = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["alias"]
        constraints = [
            models.UniqueConstraint(fields=["club", "normalized_alias"], name="unique_club_alias"),
        ]

    def save(self, *args, **kwargs):
        self.normalized_alias = normalize_text(self.alias)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.alias} -> {self.club.name}"


class PlayerAlias(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player_aliases")
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="player_aliases")
    alias = models.CharField(max_length=120)
    normalized_alias = models.CharField(max_length=120, db_index=True, editable=False)
    source = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["alias"]
        constraints = [
            models.UniqueConstraint(fields=["player", "club", "normalized_alias"], name="unique_player_alias"),
        ]

    def save(self, *args, **kwargs):
        self.normalized_alias = normalize_text(self.alias)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.alias} -> {self.player.name}"


class Fixture(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_LINEUP_PENDING = "lineup_pending"
    STATUS_LINEUP_PREDICTED = "lineup_predicted"
    STATUS_PUBLISHED = "published"
    STATUS_LIVE = "live"
    STATUS_FINISHED = "finished"
    STATUS_ARCHIVED = "archived"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_LINEUP_PENDING, "Lineup pending"),
        (STATUS_LINEUP_PREDICTED, "Lineup predicted"),
        (STATUS_PUBLISHED, "Published"),
        (STATUS_LIVE, "Live"),
        (STATUS_FINISHED, "Finished"),
        (STATUS_ARCHIVED, "Archived"),
    ]

    season = models.ForeignKey(Season, on_delete=models.PROTECT, related_name="fixtures")
    round = models.ForeignKey(
        Round,
        on_delete=models.SET_NULL,
        related_name="fixtures",
        null=True,
        blank=True,
    )
    home_club = models.ForeignKey(Club, on_delete=models.PROTECT, related_name="home_fixtures")
    away_club = models.ForeignKey(Club, on_delete=models.PROTECT, related_name="away_fixtures")
    kickoff_at = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True)
    result_home = models.PositiveSmallIntegerField(null=True, blank=True)
    result_away = models.PositiveSmallIntegerField(null=True, blank=True)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    share_slug = models.SlugField(max_length=180, unique=True, blank=True)
    source_name = models.CharField(max_length=120, blank=True)
    source_url = models.URLField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    lineup_confirmed_at = models.DateTimeField(null=True, blank=True)
    import_payload = models.JSONField(null=True, blank=True)
    lineup_payload = models.JSONField(null=True, blank=True)
    ratings_count = models.PositiveIntegerField(default=0)
    home_rating_avg = models.FloatField(default=0)
    away_rating_avg = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["kickoff_at", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["home_club", "away_club", "kickoff_at"],
                name="unique_fixture_home_away_kickoff",
            ),
        ]
        indexes = [
            models.Index(fields=["season", "kickoff_at"], name="fixture_season_kickoff_idx"),
            models.Index(fields=["status", "kickoff_at"], name="fixture_status_kickoff_idx"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug("slug")
        if not self.share_slug:
            self.share_slug = self._generate_unique_slug("share_slug")
        super().save(*args, **kwargs)

    def _generate_unique_slug(self, field_name: str) -> str:
        date_part = timezone.localtime(self.kickoff_at).date().isoformat() if self.kickoff_at else "fixture"
        base_slug = slugify_value(f"{self.home_club.name} {self.away_club.name} {date_part}")
        candidate = base_slug
        suffix = 2
        queryset = Fixture.objects.all()
        if self.pk:
            queryset = queryset.exclude(pk=self.pk)
        while queryset.filter(**{field_name: candidate}).exists():
            candidate = f"{base_slug}-{suffix}"
            suffix += 1
        return candidate

    def __str__(self):
        return f"{self.home_club.name} vs {self.away_club.name}"


class FixturePlayer(models.Model):
    SIDE_HOME = "home"
    SIDE_AWAY = "away"

    SIDE_CHOICES = [
        (SIDE_HOME, "Home"),
        (SIDE_AWAY, "Away"),
    ]

    STATUS_PREDICTED = "predicted"
    STATUS_STARTING_XI = "starting_xi"
    STATUS_BENCH = "bench"
    STATUS_PLAYED = "played"
    STATUS_UNUSED = "unused"
    STATUS_HIDDEN = "hidden"

    SELECTION_STATUS_CHOICES = [
        (STATUS_PREDICTED, "Predicted"),
        (STATUS_STARTING_XI, "Starting XI"),
        (STATUS_BENCH, "Bench"),
        (STATUS_PLAYED, "Played"),
        (STATUS_UNUSED, "Unused"),
        (STATUS_HIDDEN, "Hidden"),
    ]

    SOURCE_AUTO_FULL_SQUAD = "auto_full_squad"
    SOURCE_MANUAL = "manual"
    SOURCE_PASTE_IMPORT = "paste_import"
    SOURCE_LLM_MATCH = "llm_match"

    SOURCE_TYPE_CHOICES = [
        (SOURCE_AUTO_FULL_SQUAD, "Auto full squad"),
        (SOURCE_MANUAL, "Manual"),
        (SOURCE_PASTE_IMPORT, "Paste import"),
        (SOURCE_LLM_MATCH, "LLM match"),
    ]

    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE, related_name="fixture_players")
    player = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        related_name="fixture_players",
        null=True,
        blank=True,
    )
    club = models.ForeignKey(Club, on_delete=models.PROTECT, related_name="fixture_players")
    side = models.CharField(max_length=8, choices=SIDE_CHOICES)
    selection_status = models.CharField(
        max_length=20,
        choices=SELECTION_STATUS_CHOICES,
        default=STATUS_PREDICTED,
        db_index=True,
    )
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES, default=SOURCE_MANUAL)
    source_confidence = models.CharField(max_length=16, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    shirt_number = models.PositiveSmallIntegerField(null=True, blank=True)
    minutes_played = models.PositiveSmallIntegerField(null=True, blank=True)
    is_visible_public = models.BooleanField(default=True)
    raw_name = models.CharField(max_length=120, blank=True)
    position_label = models.CharField(max_length=16, blank=True)
    is_captain = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["side", "sort_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["fixture", "player"],
                condition=Q(player__isnull=False),
                name="unique_fixture_player_assignment",
            ),
        ]
        indexes = [
            models.Index(fields=["fixture", "side", "selection_status"], name="fixture_side_status_idx"),
        ]

    def __str__(self):
        return self.player.name if self.player else self.raw_name


class FixtureRating(models.Model):
    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE, related_name="ratings")
    fixture_player = models.ForeignKey(FixturePlayer, on_delete=models.CASCADE, related_name="ratings")
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="fixture_ratings",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="fixture_ratings",
        null=True,
        blank=True,
    )
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    value = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]
        constraints = [
            models.CheckConstraint(
                check=Q(user__isnull=False) | ~Q(session_key=""),
                name="fixture_rating_user_or_session_required",
            ),
            models.UniqueConstraint(
                fields=["fixture_player", "user"],
                condition=Q(user__isnull=False),
                name="unique_fixture_rating_per_user",
            ),
            models.UniqueConstraint(
                fields=["fixture_player", "session_key"],
                condition=~Q(session_key=""),
                name="unique_fixture_rating_per_session",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.player_id and self.fixture_player_id and self.fixture_player.player_id:
            self.player_id = self.fixture_player.player_id
        if not self.fixture_id and self.fixture_player_id:
            self.fixture_id = self.fixture_player.fixture_id
        super().save(*args, **kwargs)

    def __str__(self):
        player_name = self.player.name if self.player else self.fixture_player.raw_name
        return f"{player_name}: {self.value}"


@receiver([post_save, post_delete], sender=FixtureRating)
def sync_fixture_rating_aggregates(sender, instance, **kwargs):
    from players.rating_aggregates import refresh_fixture_rating_summary, refresh_player_rating_snapshot

    if instance.player_id:
        refresh_player_rating_snapshot(instance.player)
    refresh_fixture_rating_summary(instance.fixture)
