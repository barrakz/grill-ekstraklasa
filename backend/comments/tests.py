
from django.test import TestCase
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
