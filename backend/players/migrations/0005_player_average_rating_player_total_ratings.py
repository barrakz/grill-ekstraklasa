# Generated by Django 4.2.20 on 2025-06-13 16:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("players", "0004_alter_player_name_alter_player_position_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="average_rating",
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name="player",
            name="total_ratings",
            field=models.IntegerField(default=0),
        ),
    ]
