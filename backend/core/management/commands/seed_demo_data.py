import random
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone

from clubs.models import Club
from players.models import Player, PlayerMedia
from ratings.models import Rating
from comments.models import Comment


CLUBS = [
    "Legia Warszawa",
    "Lech Poznań",
    "Raków Częstochowa",
    "Pogoń Szczecin",
    "Widzew Łódź",
    "Górnik Zabrze",
    "Śląsk Wrocław",
    "Jagiellonia Białystok",
    "Cracovia",
    "Korona Kielce",
    "Piast Gliwice",
    "Zagłębie Lubin",
    "Radomiak Radom",
    "Lechia Gdańsk",
    "Arka Gdynia",
    "Motor Lublin",
    "Wisła Płock",
    "Termalica Nieciecza",
]

FIRST_NAMES = [
    "Jan", "Piotr", "Kacper", "Mateusz", "Michał", "Tomasz", "Bartek", "Adrian",
    "Kamil", "Maciej", "Łukasz", "Jakub", "Filip", "Szymon", "Damian", "Patryk",
]

LAST_NAMES = [
    "Kowalski", "Nowak", "Wiśniewski", "Zieliński", "Wójcik", "Kaczmarek", "Mazur",
    "Krawczyk", "Dąbrowski", "Piotrowski", "Grabowski", "Pawłowski", "Michalski",
]

NATIONALITIES = ["Polska", "Hiszpania", "Niemcy", "Czechy", "Słowacja", "Ukraina", "Serbia"]

COMMENT_TEMPLATES = [
    "To był mecz życia... ale nie jego.",
    "Biegał jakby miał piasek w butach.",
    "Pierwszy do memów, ostatni do piłki.",
    "Kibice już szykują mu kompilację wpadek.",
    "Z taką formą to tylko FIFA na easy.",
    "Dziś każdy kontakt z piłką był jak rzut karny w trybuny.",
    "Oglądanie tego było jak test cierpliwości.",
    "To był pokaz anty-futbolu.",
]

POSITIONS = ["GK", "DF", "MF", "FW"]


def random_datetime(start, end):
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))


class Command(BaseCommand):
    help = "Seed demo data for clubs, players, ratings, comments, and media without AI responses."

    def handle(self, *args, **options):
        random.seed(42)

        now = timezone.now()
        today = timezone.localdate()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=7)
        start_week_dt = timezone.make_aware(datetime.combine(start_of_week, datetime.min.time()))
        end_week_dt = timezone.make_aware(datetime.combine(end_of_week, datetime.min.time()))

        # Clubs
        clubs = []
        for club_name in CLUBS[:18]:
            club, _ = Club.objects.get_or_create(
                name=club_name,
                defaults={"city": club_name.split(" ")[-1], "founded_year": None},
            )
            clubs.append(club)
        self.stdout.write(self.style.SUCCESS(f"Clubs ready: {len(clubs)}"))

        # Users
        users = []
        for idx in range(1, 51):
            username = f"kibic{idx}"
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password("kibic123")
                user.save()
            users.append(user)
        self.stdout.write(self.style.SUCCESS(f"Users ready: {len(users)}"))

        # Players
        existing_names = set(Player.objects.values_list("name", flat=True))
        created_players = 0
        target_players_per_club = 16

        for club in clubs:
            current_players = Player.objects.filter(club=club).count()
            missing = max(0, target_players_per_club - current_players)
            for i in range(missing):
                first = random.choice(FIRST_NAMES)
                last = random.choice(LAST_NAMES)
                name = f"{first} {last}"
                attempts = 0
                while name in existing_names and attempts < 10:
                    first = random.choice(FIRST_NAMES)
                    last = random.choice(LAST_NAMES)
                    name = f"{first} {last}"
                    attempts += 1

                player = Player.objects.create(
                    name=name,
                    position=POSITIONS[i % len(POSITIONS)],
                    club=club,
                    nationality=random.choice(NATIONALITIES),
                )
                existing_names.add(name)
                created_players += 1

        self.stdout.write(self.style.SUCCESS(f"Players created: {created_players}"))

        players = list(Player.objects.select_related("club"))

        # Ratings & comments
        for idx, player in enumerate(players):
            target_ratings = random.randint(8, 18)
            current_ratings = Rating.objects.filter(player=player).count()
            ratings_to_add = max(0, target_ratings - current_ratings)

            weekly_ratings = 1 if idx < 40 else 0

            for r_idx in range(ratings_to_add):
                rating = Rating.objects.create(
                    player=player,
                    user=random.choice(users),
                    value=random.randint(1, 10),
                )
                if r_idx < weekly_ratings:
                    created_at = random_datetime(start_week_dt, end_week_dt - timedelta(seconds=1))
                else:
                    created_at = random_datetime(now - timedelta(days=30), now)
                Rating.objects.filter(id=rating.id).update(created_at=created_at)

            target_comments = random.randint(2, 5)
            current_comments = Comment.objects.filter(player=player).count()
            comments_to_add = max(0, target_comments - current_comments)
            weekly_comments = 1 if idx < 40 else 0

            for c_idx in range(comments_to_add):
                comment = Comment.objects.create(
                    player=player,
                    user=random.choice(users),
                    content=random.choice(COMMENT_TEMPLATES),
                    ai_response=None,
                )
                if c_idx < weekly_comments:
                    created_at = random_datetime(start_week_dt, end_week_dt - timedelta(seconds=1))
                else:
                    created_at = random_datetime(now - timedelta(days=30), now)
                Comment.objects.filter(id=comment.id).update(created_at=created_at, updated_at=created_at)

        self.stdout.write(self.style.SUCCESS("Ratings and comments updated."))

        # Media: only sync existing entries, do not create placeholders
        for player in players:
            for url in player.gif_urls or []:
                PlayerMedia.objects.get_or_create(
                    player=player,
                    media_type=PlayerMedia.MEDIA_GIF,
                    url=url,
                )
            for url in player.tweet_urls or []:
                PlayerMedia.objects.get_or_create(
                    player=player,
                    media_type=PlayerMedia.MEDIA_TWEET,
                    url=url,
                )

            player.gif_urls = list(
                PlayerMedia.objects.filter(
                    player=player, media_type=PlayerMedia.MEDIA_GIF
                ).order_by('-created_at').values_list('url', flat=True)
            )
            player.tweet_urls = list(
                PlayerMedia.objects.filter(
                    player=player, media_type=PlayerMedia.MEDIA_TWEET
                ).order_by('-created_at').values_list('url', flat=True)
            )
            player.save(update_fields=["gif_urls", "tweet_urls"])

        self.stdout.write(self.style.SUCCESS("Media synced (no placeholder links added)."))
