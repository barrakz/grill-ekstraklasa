from django.contrib import admin
from .models import Comment

# Register Comment model in the admin panel
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'player', 'user', 'content', 'likes_count', 'created_at')
    list_filter = ('player', 'user', 'created_at')
    search_fields = ('content', 'player__name', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('player', 'user')
