from django.core.management.base import BaseCommand
from players.models import Player
from ratings.models import Rating
from django.db.models import Avg, Count

class Command(BaseCommand):
    help = 'Przelicza średnie ocen i liczbę ocen dla wszystkich piłkarzy'

    def add_arguments(self, parser):
        parser.add_argument(
            '--player-id',
            type=int,
            help='ID piłkarza, dla którego chcesz przeliczyć oceny (opcjonalne)',
        )

    def handle(self, *args, **kwargs):
        player_id = kwargs.get('player_id')
        
        if player_id:
            players = Player.objects.filter(id=player_id)
            self.stdout.write(f'Przeliczanie ocen dla piłkarza o ID={player_id}')
        else:
            players = Player.objects.all()
            self.stdout.write(f'Przeliczanie ocen dla wszystkich {players.count()} piłkarzy')
        
        updated_count = 0
        
        for player in players:
            # Pobieramy agregaty bezpośrednio z bazy danych
            rating_data = Rating.objects.filter(player=player).aggregate(
                avg_rating=Avg('value'),
                count=Count('id')
            )
            
            player.average_rating = rating_data['avg_rating'] or 0
            player.total_ratings = rating_data['count'] or 0
            player.save(update_fields=['average_rating', 'total_ratings'])
            
            updated_count += 1
            
        self.stdout.write(self.style.SUCCESS(f'Pomyślnie zaktualizowano oceny dla {updated_count} piłkarzy'))
