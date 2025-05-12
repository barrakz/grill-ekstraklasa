from rest_framework import serializers
from clubs.models import Club
from .models import Player, Rating, Comment
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'player', 'user', 'value', 'created_at']
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'player', 'user', 'content', 'sentiment', 
                 'likes_count', 'is_liked_by_user', 'created_at', 'updated_at']
        read_only_fields = ['user', 'sentiment']

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # TODO: Implement sentiment analysis
        validated_data['sentiment'] = 'neutral'
        return super().create(validated_data)


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
