from django.contrib import admin
from .models import Club


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'founded_year')
    search_fields = ('name', 'city')
    list_filter = ('city',)
    ordering = ('name',)
