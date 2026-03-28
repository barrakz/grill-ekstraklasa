from rest_framework import serializers

from .models import Fixture, FixturePlayer
from .services import current_lineup_formations, current_lineup_summary


class FixtureListSerializer(serializers.ModelSerializer):
    season_name = serializers.CharField(source="season.name", read_only=True)
    round_number = serializers.IntegerField(source="round.number", read_only=True)
    home_club_name = serializers.CharField(source="home_club.name", read_only=True)
    away_club_name = serializers.CharField(source="away_club.name", read_only=True)
    players_count = serializers.IntegerField(read_only=True)
    ratings_total = serializers.IntegerField(read_only=True)
    home_players_count = serializers.IntegerField(read_only=True)
    away_players_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Fixture
        fields = [
            "id",
            "season_name",
            "round_number",
            "kickoff_at",
            "status",
            "result_home",
            "result_away",
            "slug",
            "share_slug",
            "home_club_name",
            "away_club_name",
            "players_count",
            "ratings_total",
            "home_players_count",
            "away_players_count",
            "published_at",
            "lineup_confirmed_at",
        ]


class FixturePlayerSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source="player.name", read_only=True)
    club_name = serializers.CharField(source="club.name", read_only=True)

    class Meta:
        model = FixturePlayer
        fields = [
            "id",
            "player_id",
            "player_name",
            "raw_name",
            "club_id",
            "club_name",
            "side",
            "selection_status",
            "source_type",
            "source_confidence",
            "shirt_number",
            "position_label",
            "is_captain",
            "is_visible_public",
        ]


class FixtureDetailSerializer(serializers.ModelSerializer):
    season_name = serializers.CharField(source="season.name", read_only=True)
    round_number = serializers.IntegerField(source="round.number", read_only=True)
    home_club_name = serializers.CharField(source="home_club.name", read_only=True)
    away_club_name = serializers.CharField(source="away_club.name", read_only=True)
    home_club_id = serializers.IntegerField(source="home_club.id", read_only=True)
    away_club_id = serializers.IntegerField(source="away_club.id", read_only=True)
    lineup = serializers.SerializerMethodField()
    formation = serializers.SerializerMethodField()

    class Meta:
        model = Fixture
        fields = [
            "id",
            "season_name",
            "round_number",
            "kickoff_at",
            "status",
            "result_home",
            "result_away",
            "slug",
            "share_slug",
            "source_name",
            "source_url",
            "published_at",
            "lineup_confirmed_at",
            "ratings_count",
            "home_rating_avg",
            "away_rating_avg",
            "home_club_id",
            "away_club_id",
            "home_club_name",
            "away_club_name",
            "formation",
            "lineup",
        ]

    def get_lineup(self, obj):
        return current_lineup_summary(obj)

    def get_formation(self, obj):
        return current_lineup_formations(obj)


class FixturePublicDetailSerializer(serializers.ModelSerializer):
    season_name = serializers.CharField(source="season.name", read_only=True)
    round_number = serializers.IntegerField(source="round.number", read_only=True)
    home_club_name = serializers.CharField(source="home_club.name", read_only=True)
    away_club_name = serializers.CharField(source="away_club.name", read_only=True)
    lineup = serializers.SerializerMethodField()
    formation = serializers.SerializerMethodField()

    class Meta:
        model = Fixture
        fields = [
            "id",
            "season_name",
            "round_number",
            "kickoff_at",
            "status",
            "result_home",
            "result_away",
            "slug",
            "share_slug",
            "published_at",
            "lineup_confirmed_at",
            "ratings_count",
            "home_rating_avg",
            "away_rating_avg",
            "home_club_name",
            "away_club_name",
            "formation",
            "lineup",
        ]

    def get_lineup(self, obj):
        return current_lineup_summary(obj, public_only=True, include_rating_summary=True)

    def get_formation(self, obj):
        return current_lineup_formations(obj, public_only=True)
