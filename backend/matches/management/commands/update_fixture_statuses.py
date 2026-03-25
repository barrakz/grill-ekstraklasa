from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from matches.models import Fixture


class Command(BaseCommand):
    help = "Automatycznie ustawia statusy meczów na live/finished na podstawie kickoff_at."

    def handle(self, *args, **options):
        now = timezone.now()
        finish_delta = timedelta(hours=2, minutes=5)
        archive_delta = timedelta(days=5)
        finish_cutoff = now - finish_delta
        archive_cutoff = now - (finish_delta + archive_delta)

        to_live = Fixture.objects.filter(
            status__in=[Fixture.STATUS_PUBLISHED, Fixture.STATUS_LINEUP_PREDICTED],
            kickoff_at__lte=now,
            kickoff_at__gt=finish_cutoff,
        )

        to_finished = Fixture.objects.filter(
            status__in=[Fixture.STATUS_PUBLISHED, Fixture.STATUS_LINEUP_PREDICTED, Fixture.STATUS_LIVE],
            kickoff_at__lte=finish_cutoff,
        )

        to_archived = Fixture.objects.filter(
            status=Fixture.STATUS_FINISHED,
            kickoff_at__lte=archive_cutoff,
        )

        live_count = to_live.update(status=Fixture.STATUS_LIVE)
        finished_count = to_finished.update(status=Fixture.STATUS_FINISHED)
        archived_count = to_archived.update(status=Fixture.STATUS_ARCHIVED)

        self.stdout.write(
            f"[update_fixture_statuses] live: {live_count}, finished: {finished_count}, archived: {archived_count}, now={now.isoformat()}"
        )
