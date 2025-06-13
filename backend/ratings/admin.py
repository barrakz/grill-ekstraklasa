from django.contrib import admin
from .models import Rating

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("user", "player", "value", "created_at")
    list_filter = ("value", "created_at")
    search_fields = ("player__name", "user__username")
    raw_id_fields = ("player", "user")
    date_hierarchy = "created_at"
