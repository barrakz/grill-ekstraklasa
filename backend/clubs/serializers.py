from rest_framework import serializers
from .models import Club
from players.models import Player

class PlayerBasicSerializer(serializers.ModelSerializer):
    """Uproszczony serializator dla piłkarzy w kontekście klubu"""
    class Meta:
        model = Player
        fields = ['id', 'name', 'position', 'nationality']

class ClubSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    players_count = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = ['id', 'name', 'city', 'founded_year', 'logo_url', 'players_count']
    
    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None
        
    def get_players_count(self, obj):
        return obj.players.count()

class ClubDetailSerializer(ClubSerializer):
    players = PlayerBasicSerializer(many=True, read_only=True)
    
    class Meta(ClubSerializer.Meta):
        fields = ClubSerializer.Meta.fields + ['players'] 