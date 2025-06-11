from django.db import models
from django.contrib.auth.models import User
from players.models import Player
from django.core.validators import MinValueValidator, MaxValueValidator

class Comment(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_comments')
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.player.name}"
    
    @property
    def likes_count(self):
        return self.likes.count()
