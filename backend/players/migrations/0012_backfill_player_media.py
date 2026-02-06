from datetime import timedelta

from django.db import migrations
from django.utils import timezone


def backfill_player_media(apps, schema_editor):
    Player = apps.get_model('players', 'Player')
    PlayerMedia = apps.get_model('players', 'PlayerMedia')

    now = timezone.now()

    for player in Player.objects.all():
        gif_urls = list(player.gif_urls or [])
        tweet_urls = list(player.tweet_urls or [])

        # Assume legacy lists append newest at the end
        for idx, url in enumerate(gif_urls):
            created_at = now - timedelta(seconds=(len(gif_urls) - idx))
            PlayerMedia.objects.get_or_create(
                player=player,
                media_type='gif',
                url=url,
                defaults={'created_at': created_at},
            )

        for idx, url in enumerate(tweet_urls):
            created_at = now - timedelta(seconds=(len(tweet_urls) - idx))
            PlayerMedia.objects.get_or_create(
                player=player,
                media_type='tweet',
                url=url,
                defaults={'created_at': created_at},
            )


def reverse_backfill(apps, schema_editor):
    # No-op: do not delete any media
    return


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0011_player_media'),
    ]

    operations = [
        migrations.RunPython(backfill_player_media, reverse_backfill),
    ]
