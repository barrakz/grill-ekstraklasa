from rest_framework import serializers
from .models import Comment
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    player_details = serializers.SerializerMethodField(read_only=True, source='player')
    
    class Meta:
        model = Comment
        fields = ['id', 'player', 'player_details', 'user', 'content', 'likes_count', 
                 'is_liked_by_user', 'created_at', 'updated_at']
        read_only_fields = ['user']

    def get_player_details(self, obj):
        if obj.player:
            return {
                'id': obj.player.id,
                'name': obj.player.name
            }
        return None

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def validate(self, data):
        if not data.get('player'):
            raise serializers.ValidationError({'player': 'This field is required.'})
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Comment.objects.create(**validated_data)
