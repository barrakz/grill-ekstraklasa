from django.contrib import admin

from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("name", "position", "club", "average_rating")
    search_fields = ("name", "club__name", "nationality")
    list_filter = ("position", "club")
