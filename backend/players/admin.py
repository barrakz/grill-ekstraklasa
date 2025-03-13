from django.contrib import admin

from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("name", "position", "club", "rating_avg")
    search_fields = ("name", "club")
    list_filter = ("position", "club")
