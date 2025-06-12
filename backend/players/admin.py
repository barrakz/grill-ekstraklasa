from django.contrib import admin

from .models import Player, Rating


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("name", "position", "club", "rating_avg")
    search_fields = ("name", "club")
    list_filter = ("position", "club")


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("user", "player", "value", "created_at")
    list_filter = ("value", "created_at")
    search_fields = ("player__name", "user__username")
    raw_id_fields = ("player", "user")
    date_hierarchy = "created_at"
