from django.contrib import admin

from .models import ClubAlias, Fixture, FixturePlayer, FixtureRating, PlayerAlias, Round, Season


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "updated_at")
    search_fields = ("name",)


@admin.register(Round)
class RoundAdmin(admin.ModelAdmin):
    list_display = ("season", "number", "status", "starts_at", "ends_at")
    list_filter = ("season", "status")


@admin.register(Fixture)
class FixtureAdmin(admin.ModelAdmin):
    list_display = ("kickoff_at", "home_club", "away_club", "season", "round", "status")
    list_filter = ("season", "status")
    search_fields = ("home_club__name", "away_club__name", "slug")


@admin.register(FixturePlayer)
class FixturePlayerAdmin(admin.ModelAdmin):
    list_display = ("fixture", "player", "raw_name", "selection_status", "side", "shirt_number")
    list_filter = ("selection_status", "side", "source_type")
    search_fields = ("player__name", "raw_name", "fixture__slug")


@admin.register(FixtureRating)
class FixtureRatingAdmin(admin.ModelAdmin):
    list_display = ("fixture", "fixture_player", "user", "session_key", "value", "updated_at")
    list_filter = ("fixture",)


@admin.register(ClubAlias)
class ClubAliasAdmin(admin.ModelAdmin):
    list_display = ("alias", "club", "source", "created_at")
    search_fields = ("alias", "club__name")


@admin.register(PlayerAlias)
class PlayerAliasAdmin(admin.ModelAdmin):
    list_display = ("alias", "player", "club", "source", "created_at")
    search_fields = ("alias", "player__name", "club__name")
