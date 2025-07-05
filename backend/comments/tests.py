
from django.test import TestCase
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from players.models import Player
from clubs.models import Club
from .models import Comment


class CommentApiAddTest(APITestCase):
    def setUp(self):
        self.club = Club.objects.create(name="Test Club", city="Test City")
        self.player = Player.objects.create(name="Test Player", position="FW", club=self.club, nationality="PL")
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.url = reverse('comment-list')

    def test_logged_user_can_add_comment(self):
        self.client.login(username="testuser", password="testpass")
        data = {
            "player_id": self.player.id,
            "content": "Komentarz przez API"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["content"], "Komentarz przez API")
        print("Test: Logged user can add comment – status:", response.status_code)


from django.test import TestCase
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from players.models import Player
from clubs.models import Club
from .models import Comment

class CommentModelTest(TestCase):
    def setUp(self):
        self.club = Club.objects.create(name="Test Club", city="Test City")
        self.player = Player.objects.create(name="Test Player", position="FW", club=self.club, nationality="PL")
        self.user = User.objects.create_user(username="testuser", password="testpass")

    def test_add_comment(self):
        comment = Comment.objects.create(player=self.player, user=self.user, content="Świetny zawodnik!")
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(comment.content, "Świetny zawodnik!")
        self.assertEqual(comment.player, self.player)
        self.assertEqual(comment.user, self.user)




class CommentApiPermissionTest(APITestCase):
    def setUp(self):
        self.club = Club.objects.create(name="Test Club", city="Test City")
        self.player = Player.objects.create(name="Test Player", position="FW", club=self.club, nationality="PL")
        self.url = reverse('comment-list')

    def test_anonymous_cannot_add_comment(self):
        data = {
            "player_id": self.player.id,
            "content": "Anonim nie może dodać"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, 401)
        print("Test: Anonymous user cannot add comment – status:", response.status_code)
