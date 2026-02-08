from django.db import migrations, models

import players.models


class Migration(migrations.Migration):
    dependencies = [
        ("players", "0012_backfill_player_media"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="card_image",
            field=models.ImageField(
                blank=True, null=True, upload_to=players.models.player_card_upload_to
            ),
        ),
    ]

