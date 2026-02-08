from rest_framework import serializers
from .models import Comment
from django.contrib.auth.models import User
from players.models import Player


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class PlayerSerializer(serializers.ModelSerializer):
    has_magic_card = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ['id', 'name', 'slug', 'has_magic_card']

    def get_has_magic_card(self, obj):
        return bool(getattr(obj, "card_image", None))


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    player = PlayerSerializer(read_only=True)
    player_id = serializers.PrimaryKeyRelatedField(
        queryset=Player.objects.exclude(club__name="Loan"), source='player', write_only=True
    )

    class Meta:
        model = Comment
        fields = ['id', 'player', 'player_id', 'user', 'content', 'likes_count',
                  'is_liked_by_user', 'ai_response', 'created_at', 'updated_at']
        read_only_fields = ['user', 'player', 'ai_response']

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Comment.objects.create(**validated_data)
