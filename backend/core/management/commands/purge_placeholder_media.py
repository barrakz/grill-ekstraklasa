from django.core.management.base import BaseCommand

from players.models import Player, PlayerMedia

PLACEHOLDER_URLS = {
    "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
    "https://media.giphy.com/media/l0HlPjezGYg6t2QYU/giphy.gif",
    "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
    "https://twitter.com/TwitterDev/status/1354143047324299264",
    "https://twitter.com/TwitterDev/status/1336401443171989504",
    "https://twitter.com/TwitterDev/status/1460323737035677698",
    "https://twitter.com/TwitterDev/status/1554997581828384768",
}


class Command(BaseCommand):
    help = "Remove placeholder GIF/Tweet URLs from PlayerMedia and legacy player lists."

    def handle(self, *args, **options):
        removed_media = PlayerMedia.objects.filter(url__in=PLACEHOLDER_URLS).delete()
        self.stdout.write(self.style.SUCCESS(f"Removed PlayerMedia entries: {removed_media[0]}"))

        players_updated = 0
        for player in Player.objects.all():
            gif_urls = [url for url in (player.gif_urls or []) if url not in PLACEHOLDER_URLS]
            tweet_urls = [url for url in (player.tweet_urls or []) if url not in PLACEHOLDER_URLS]
            if gif_urls != (player.gif_urls or []) or tweet_urls != (player.tweet_urls or []):
                player.gif_urls = gif_urls
                player.tweet_urls = tweet_urls
                player.save(update_fields=["gif_urls", "tweet_urls"])
                players_updated += 1

        self.stdout.write(self.style.SUCCESS(f"Players cleaned: {players_updated}"))
