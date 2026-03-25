from django.db import migrations


def seed_club_aliases(apps, schema_editor):
    Club = apps.get_model("clubs", "Club")
    ClubAlias = apps.get_model("matches", "ClubAlias")

    Club.objects.get_or_create(
        name="GKS Katowice",
        defaults={
            "city": "Katowice",
            "founded_year": None,
        },
    )

    termalica = Club.objects.filter(name__icontains="Termalica").first()
    if termalica:
        ClubAlias.objects.get_or_create(
            club=termalica,
            alias="Termalica B-B.",
            defaults={
                "source": "manual_import",
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("matches", "0001_initial"),
        ("clubs", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_club_aliases, migrations.RunPython.noop),
    ]
