from clubs.models import Club
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Player


class PlayerApiListTest(APITestCase):
    def setUp(self):
        self.club = Club.objects.create(name="Test Club", city="Test City")
        Player.objects.create(
            name="Test Player 1", position="FW", club=self.club, nationality="PL"
        )
        Player.objects.create(
            name="Test Player 2", position="MF", club=self.club, nationality="PL"
        )
        self.url = reverse("player-list")

    def test_get_players_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 2)
        names = [player["name"] for player in response.data['results']]
        self.assertIn("Test Player 1", names)
        self.assertIn("Test Player 2", names)
        print("Test: Players list contains:", names)


class PlayerPermissionsTest(APITestCase):
    def setUp(self):
        self.club = Club.objects.create(name="Test Club", city="Test City")
        self.player = Player.objects.create(
            name="Protected Player", position="FW", club=self.club, nationality="PL"
        )
        self.user = User.objects.create_user(username="regular", password="testpass")
        self.admin = User.objects.create_user(
            username="admin",
            password="testpass",
            is_staff=True,
        )

    def test_regular_user_cannot_update_player(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            reverse("player-detail", args=[self.player.id]),
            {"name": "Changed Name"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_admin_can_update_player(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            reverse("player-detail", args=[self.player.id]),
            {"name": "Changed Name"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.player.refresh_from_db()
        self.assertEqual(self.player.name, "Changed Name")
