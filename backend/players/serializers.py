from rest_framework import serializers
from clubs.models import Club
from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    club_name = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ['id', 'name', 'position', 'club_name', 'rating_avg', 'jersey_number', 'nationality', 'image']

    def get_club_name(self, obj):
        return obj.club.name if obj.club else None
