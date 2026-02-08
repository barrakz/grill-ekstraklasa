from django.db import migrations, models


def backfill_card_updated_at(apps, schema_editor):
    Player = apps.get_model("players", "Player")
    # Best-effort: for existing rows with a card, initialize timestamp from updated_at.
    Player.objects.filter(card_image__isnull=False).exclude(card_image="").filter(
        card_updated_at__isnull=True
    ).update(card_updated_at=models.F("updated_at"))


class Migration(migrations.Migration):
    dependencies = [
        ("players", "0013_player_card_image"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="card_updated_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.RunPython(backfill_card_updated_at, migrations.RunPython.noop),
    ]

