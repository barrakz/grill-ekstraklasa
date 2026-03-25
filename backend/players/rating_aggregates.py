from django.db.models import Avg, Count


def refresh_player_rating_snapshot(player):
    from matches.models import FixtureRating
    from ratings.models import Rating

    rating_totals = Rating.objects.filter(player=player).aggregate(
        count=Count("id"),
        avg=Avg("value"),
    )
    fixture_rating_totals = FixtureRating.objects.filter(player=player).aggregate(
        count=Count("id"),
        avg=Avg("value"),
    )

    classic_count = rating_totals["count"] or 0
    fixture_count = fixture_rating_totals["count"] or 0
    total_count = classic_count + fixture_count

    if total_count:
        weighted_sum = (rating_totals["avg"] or 0) * classic_count
        weighted_sum += (fixture_rating_totals["avg"] or 0) * fixture_count
        average_rating = round(weighted_sum / total_count, 2)
    else:
        average_rating = 0

    player.average_rating = average_rating
    player.total_ratings = total_count
    player.save(update_fields=["average_rating", "total_ratings"])


def refresh_fixture_rating_summary(fixture):
    from matches.models import FixtureRating

    fixture_qs = FixtureRating.objects.filter(fixture=fixture)
    grouped = fixture_qs.values("fixture_player__side").annotate(
        count=Count("id"),
        avg=Avg("value"),
    )

    home_avg = 0
    away_avg = 0
    total_count = 0
    for row in grouped:
        side = row["fixture_player__side"]
        total_count += row["count"] or 0
        if side == "home":
            home_avg = round(row["avg"] or 0, 2)
        elif side == "away":
            away_avg = round(row["avg"] or 0, 2)

    fixture.ratings_count = total_count
    fixture.home_rating_avg = home_avg
    fixture.away_rating_avg = away_avg
    fixture.save(update_fields=["ratings_count", "home_rating_avg", "away_rating_avg"])
