from rest_framework import serializers
from .models import Club

class ClubSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = ['id', 'name', 'city', 'founded_year', 'logo_url']
    
    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None 