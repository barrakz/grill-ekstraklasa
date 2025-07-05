from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from clubs.models import Club
from .models import Player

class PlayerApiListTest(APITestCase):
    def setUp(self):
        self.club = Club.objects.create(name="Test Club", city="Test City")
        Player.objects.create(name="Test Player 1", position="FW", club=self.club, nationality="PL")
        Player.objects.create(name="Test Player 2", position="MF", club=self.club, nationality="PL")
        self.url = reverse('player-list')

    def test_get_players_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        names = [player['name'] for player in response.data]
        self.assertIn("Test Player 1", names)
        self.assertIn("Test Player 2", names)
        print("Test: Players list contains:", names)
from django.test import TestCase

# Create your tests here.
