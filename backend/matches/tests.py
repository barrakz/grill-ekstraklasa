from datetime import timedelta

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from clubs.models import Club
from players.models import Player
from ratings.models import Rating

from .models import Fixture, FixturePlayer, FixtureRating, PlayerAlias, Round, Season


class MatchImportApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin", password="secret", is_staff=True)
        self.client.force_authenticate(user=self.admin)

        self.legia = Club.objects.create(name="Legia Warszawa", city="Warszawa")
        self.cracovia = Club.objects.create(name="Cracovia", city="Kraków")
        self.zaglebie = Club.objects.create(name="Zagłębie Lubin", city="Lubin")
        self.widzew = Club.objects.create(name="Widzew Łódź", city="Łódź")

        self.legia_player = Player.objects.create(
            name="Bartek Michalski",
            position="GK",
            club=self.legia,
            nationality="PL",
        )
        self.legia_player_two = Player.objects.create(
            name="Kacper Piotrowski",
            position="FW",
            club=self.legia,
            nationality="PL",
        )
        self.cracovia_player = Player.objects.create(
            name="Damian Kowalski",
            position="DF",
            club=self.cracovia,
            nationality="PL",
        )
        self.cracovia_player_two = Player.objects.create(
            name="Patryk Krawczyk",
            position="MF",
            club=self.cracovia,
            nationality="PL",
        )

    def test_fixture_analyze_matches_short_and_ascii_names(self):
        response = self.client.post(
            reverse("admin-fixture-import-analyze"),
            {
                "payload": {
                    "matches": [
                        {
                            "round": 24,
                            "date": "2026-03-08",
                            "time": "20:15",
                            "home_team": "Legia",
                            "away_team": "Cracovia",
                            "status": "scheduled",
                        },
                        {
                            "round": 24,
                            "date": "2026-03-07",
                            "time": "20:15",
                            "home_team": "Widzew Lodz",
                            "away_team": "Zaglebie",
                            "status": "scheduled",
                        },
                    ]
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["entries"][0]["home_club"]["id"], self.legia.id)
        self.assertEqual(response.data["entries"][1]["home_club"]["id"], self.widzew.id)
        self.assertEqual(response.data["entries"][1]["away_club"]["id"], self.zaglebie.id)

    def test_fixture_confirm_can_attach_full_squads(self):
        analyze_response = self.client.post(
            reverse("admin-fixture-import-analyze"),
            {
                "payload": {
                    "matches": [
                        {
                            "round": 24,
                            "date": "2026-03-08",
                            "time": "20:15",
                            "home_team": "Legia",
                            "away_team": "Cracovia",
                            "status": "scheduled",
                        }
                    ]
                }
            },
            format="json",
        )
        entries = analyze_response.data["entries"]

        confirm_response = self.client.post(
            reverse("admin-fixture-import-confirm"),
            {
                "entries": entries,
                "attach_full_squads": True,
            },
            format="json",
        )

        self.assertEqual(confirm_response.status_code, 201)
        fixture = Fixture.objects.get()
        self.assertEqual(fixture.home_club, self.legia)
        self.assertEqual(fixture.away_club, self.cracovia)
        self.assertEqual(FixturePlayer.objects.filter(fixture=fixture).count(), 4)

    def test_lineup_confirm_creates_aliases_and_aggregates_fixture_ratings(self):
        season = Season.objects.create(name="2025/2026", is_active=True)
        round_instance = Round.objects.create(season=season, number=24)
        fixture = Fixture.objects.create(
            season=season,
            round=round_instance,
            home_club=self.legia,
            away_club=self.cracovia,
            kickoff_at=timezone.now(),
            status=Fixture.STATUS_LINEUP_PENDING,
        )

        analyze_response = self.client.post(
            reverse("admin-lineup-import-analyze", args=[fixture.id]),
            {
                "payload": {
                    "match": {
                        "home_team": "Legia",
                        "away_team": "Cracovia",
                    },
                    "teams": {
                        "Legia": {
                            "starting_lineup": [
                                {"number": 1, "name": "Michalski B."},
                                {"number": 9, "name": "Piotrowski K."},
                            ],
                            "substitutes": [],
                        },
                        "Cracovia": {
                            "starting_lineup": [
                                {"number": 4, "name": "Kowalski D."},
                                {"number": 7, "name": "Krawczyk P."},
                            ],
                            "substitutes": [],
                        },
                    },
                }
            },
            format="json",
        )

        self.assertEqual(analyze_response.status_code, 200)
        confirm_response = self.client.post(
            reverse("admin-lineup-import-confirm", args=[fixture.id]),
            {
                "entries": analyze_response.data["entries"],
                "payload": {
                    "match": {
                        "home_team": "Legia",
                        "away_team": "Cracovia",
                    }
                },
            },
            format="json",
        )

        self.assertEqual(confirm_response.status_code, 201)
        fixture.refresh_from_db()
        self.assertEqual(fixture.status, Fixture.STATUS_PUBLISHED)
        self.assertEqual(FixturePlayer.objects.filter(fixture=fixture).count(), 4)
        self.assertTrue(
            PlayerAlias.objects.filter(player=self.legia_player, alias="Michalski B.").exists()
        )

        classic_user = User.objects.create_user(username="classic", password="secret")
        Rating.objects.create(player=self.legia_player, user=classic_user, value=6)

        fixture_player = FixturePlayer.objects.get(fixture=fixture, player=self.legia_player)
        FixtureRating.objects.create(
            fixture=fixture,
            fixture_player=fixture_player,
            player=self.legia_player,
            session_key="session-1",
            value=8,
        )

        self.legia_player.refresh_from_db()
        self.assertEqual(self.legia_player.total_ratings, 2)
        self.assertEqual(self.legia_player.average_rating, 7.0)


class MatchPublicApiTests(APITestCase):
    def setUp(self):
        self.home = Club.objects.create(name="Radomiak Radom", city="Radom")
        self.away = Club.objects.create(name="Arka Gdynia", city="Gdynia")
        self.season = Season.objects.create(name="2025/2026", is_active=True)
        self.round = Round.objects.create(season=self.season, number=19)
        self.home_player = Player.objects.create(
            name="Jan Testowy",
            position="MF",
            club=self.home,
            nationality="PL",
        )
        self.away_player = Player.objects.create(
            name="Adam Rezerwowy",
            position="FW",
            club=self.away,
            nationality="PL",
        )
        self.fixture = Fixture.objects.create(
            season=self.season,
            round=self.round,
            home_club=self.home,
            away_club=self.away,
            kickoff_at=timezone.now() + timedelta(days=1),
            status=Fixture.STATUS_PUBLISHED,
        )
        self.visible_fixture_player = FixturePlayer.objects.create(
            fixture=self.fixture,
            player=self.home_player,
            club=self.home,
            side=FixturePlayer.SIDE_HOME,
            selection_status=FixturePlayer.STATUS_STARTING_XI,
            source_type=FixturePlayer.SOURCE_MANUAL,
            source_confidence="high",
            is_visible_public=True,
            raw_name=self.home_player.name,
        )
        FixturePlayer.objects.create(
            fixture=self.fixture,
            player=self.away_player,
            club=self.away,
            side=FixturePlayer.SIDE_AWAY,
            selection_status=FixturePlayer.STATUS_BENCH,
            source_type=FixturePlayer.SOURCE_AUTO_FULL_SQUAD,
            source_confidence="high",
            is_visible_public=False,
            raw_name=self.away_player.name,
        )
        self.hidden_fixture = Fixture.objects.create(
            season=self.season,
            round=self.round,
            home_club=self.home,
            away_club=self.away,
            kickoff_at=timezone.now() + timedelta(days=2),
            status=Fixture.STATUS_DRAFT,
        )
        self.hidden_fixture_player = FixturePlayer.objects.create(
            fixture=self.hidden_fixture,
            player=self.home_player,
            club=self.home,
            side=FixturePlayer.SIDE_HOME,
            selection_status=FixturePlayer.STATUS_STARTING_XI,
            source_type=FixturePlayer.SOURCE_MANUAL,
            source_confidence="high",
            is_visible_public=True,
            raw_name=self.home_player.name,
        )

    def test_public_detail_hides_non_public_fixture_players(self):
        response = self.client.get(reverse("fixture-detail", args=[self.fixture.slug]))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["lineup"]["home"]), 1)
        self.assertEqual(response.data["lineup"].get("away", []), [])

    def test_anonymous_fixture_rating_uses_session_and_updates_summary(self):
        response = self.client.post(
            reverse("fixture-rating", args=[self.fixture.slug]),
            {
                "fixture_player_id": self.visible_fixture_player.id,
                "value": 9,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.fixture.refresh_from_db()
        self.home_player.refresh_from_db()
        self.assertEqual(self.fixture.ratings_count, 1)
        self.assertEqual(self.home_player.total_ratings, 1)
        self.assertEqual(self.home_player.average_rating, 9.0)

    def test_public_list_excludes_hidden_statuses(self):
        response = self.client.get(reverse("fixture-list"), {"scope": "upcoming", "limit": 20})

        self.assertEqual(response.status_code, 200)
        slugs = [item["slug"] for item in response.data]
        self.assertIn(self.fixture.slug, slugs)
        self.assertNotIn(self.hidden_fixture.slug, slugs)

    def test_public_detail_returns_404_for_hidden_fixture_status(self):
        response = self.client.get(reverse("fixture-detail", args=[self.hidden_fixture.slug]))
        self.assertEqual(response.status_code, 404)

    def test_public_rating_returns_404_for_hidden_fixture_status(self):
        response = self.client.post(
            reverse("fixture-rating", args=[self.hidden_fixture.slug]),
            {
                "fixture_player_id": self.hidden_fixture_player.id,
                "value": 8,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 404)
