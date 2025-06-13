from rest_framework import serializers
from clubs.models import Club
from .models import Player
from ratings.models import Rating
from ratings.serializers import RatingSerializer
from comments.models import Comment
from comments.serializers import CommentSerializer
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class PlayerSerializer(serializers.ModelSerializer):
    rating_avg = serializers.FloatField(read_only=True)
    total_ratings = serializers.IntegerField(read_only=True)
    recent_ratings = serializers.IntegerField(read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)
    photo_url = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    recent_comments = CommentSerializer(many=True, read_only=True, source='comments')

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'position', 'club_name', 'nationality',
            'date_of_birth', 'height', 'weight', 'photo_url',
            'rating_avg', 'total_ratings', 'recent_ratings',
            'user_rating', 'recent_comments'
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = Rating.objects.get(player=obj, user=request.user)
                return RatingSerializer(rating).data
            except Rating.DoesNotExist:
                return None
        return None
