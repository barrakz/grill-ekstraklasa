from django.core.management.base import BaseCommand
from django.utils.text import slugify
from players.models import Player


class Command(BaseCommand):
    help = 'Generuje slugi dla wszystkich zawodników bez sluga'

    def handle(self, *args, **kwargs):
        # Pobieramy wszystkich zawodników bez sluga
        players_without_slug = Player.objects.filter(slug__isnull=True)
        count = players_without_slug.count()
        
        self.stdout.write(f"Znaleziono {count} zawodników bez sluga.")
        
        for player in players_without_slug:
            # Generowanie podstawowego sluga
            base_slug = slugify(player.name)
            unique_slug = base_slug
            counter = 1
            
            # Sprawdzanie unikalności
            while Player.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Zapisanie sluga
            player.slug = unique_slug
            player.save(update_fields=['slug'])
            
            self.stdout.write(f"Wygenerowano slug '{unique_slug}' dla zawodnika '{player.name}'")
        
        self.stdout.write(self.style.SUCCESS(f"Zakończono generowanie slugów dla {count} zawodników."))
