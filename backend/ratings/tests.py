
from django.test import TestCase
from django.contrib.auth.models import User
from players.models import Player
from clubs.models import Club
from .models import Rating

class RatingModelTest(TestCase):
    def setUp(self):
        self.club = Club.objects.create(name="Test Club", city="Test City")
        self.player = Player.objects.create(name="Test Player", position="FW", club=self.club, nationality="PL")
        self.user = User.objects.create_user(username="testuser", password="testpass")

    def test_add_rating(self):
        rating = Rating.objects.create(player=self.player, user=self.user, value=8)
        self.assertEqual(Rating.objects.count(), 1)
        self.assertEqual(rating.value, 8)
        self.assertEqual(rating.player, self.player)
        self.assertEqual(rating.user, self.user)

    def test_average_rating_calculation(self):
        user2 = User.objects.create_user(username="testuser2", password="testpass2")
        Rating.objects.create(player=self.player, user=self.user, value=6)
        Rating.objects.create(player=self.player, user=user2, value=8)
        self.player.refresh_from_db()
        self.assertEqual(self.player.average_rating, 7.0)
        self.assertEqual(self.player.total_ratings, 2)
        print(f"Test: Average rating for player is {self.player.average_rating} (should be 7.0)")
