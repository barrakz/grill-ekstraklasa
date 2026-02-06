from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from django.core.files.storage import default_storage
from urllib.parse import urlparse

from .models import Player, PlayerMedia


@staff_member_required
def admin_delete_gif(request, player_id, gif_index):
    """Delete a GIF from admin panel"""
    player = get_object_or_404(Player, pk=player_id)
    
    if not player.gif_urls or gif_index >= len(player.gif_urls):
        messages.error(request, "GIF nie został znaleziony")
        return redirect('admin:players_player_change', player_id)
    
    gif_url = player.gif_urls[gif_index]
    
    # Remove from list
    player.gif_urls.pop(gif_index)
    player.save()

    PlayerMedia.objects.filter(
        player=player,
        media_type=PlayerMedia.MEDIA_GIF,
        url=gif_url
    ).delete()
    
    # Try to delete from storage
    try:
        if gif_url.startswith('http'):
            parsed = urlparse(gif_url)
            path = parsed.path.lstrip('/')
        else:
            path = gif_url
        
        if default_storage.exists(path):
            default_storage.delete(path)
    except Exception:
        pass  # Continue even if file deletion fails
    
    messages.success(request, "GIF został usunięty")
    return redirect('admin:players_player_change', player_id)
