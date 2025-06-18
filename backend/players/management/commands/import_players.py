import json
import os
from django.core.management.base import BaseCommand
from players.models import Player
from clubs.models import Club
from django.db import transaction
from django.utils import timezone
import glob

class Command(BaseCommand):
    """
    Import players from JSON files into the database.
    
    This simplified script automatically:
    - Processes all JSON files in the data directory
    - Creates clubs if they don't exist in the database
    - Skips players that already exist (checking only by name)
    - Removes players from the database that aren't in the JSON files
    
    ## Basic Usage:
    ```
    python manage.py import_players
    ```
    
    ### Running in Docker:
    ```
    docker exec -it grill-backend python manage.py import_players
    ```
    """
    
    help = 'Import players from JSON files, skip existing players, and remove missing ones'
    
    @transaction.atomic
    def handle(self, *args, **options):
        # Define base directory for JSON files
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        data_dir = os.path.join(base_dir, 'data')
        
        # Get all JSON files in data directory
        json_pattern = os.path.join(data_dir, '*.json')
        json_files = glob.glob(json_pattern)
        self.stdout.write(self.style.SUCCESS(f'Found {len(json_files)} JSON files to process'))
        
        if not json_files:
            self.stdout.write(self.style.ERROR('No JSON files found in the data directory'))
            return
        
        # Process all files
        total_players_created = 0
        total_players_skipped = 0
        total_players_removed = 0
        total_clubs_created = 0
        
        # Get all existing clubs from the database
        existing_clubs = {club.name.lower(): club for club in Club.objects.all()}
        self.stdout.write(self.style.SUCCESS(f'Found {len(existing_clubs)} clubs in the database'))
        
        # Track processed players to handle removal
        all_processed_players = set()
        processed_clubs = set()
        
        for json_file in json_files:
            self.stdout.write(self.style.SUCCESS(f'Processing file: {json_file}'))
            file_players_created = 0
            file_players_skipped = 0
            file_clubs_created = 0
            
            try:
                with open(json_file, 'r', encoding='utf-8') as file:
                    players_data = json.load(file)
                    
                self.stdout.write(self.style.SUCCESS(f'Found {len(players_data)} players in the file'))
                
                # Process each player in the file
                for player_data in players_data:
                    club_name = player_data.get('club')
                    if not club_name:
                        self.stdout.write(self.style.WARNING(f"Skipping player {player_data.get('name')} - no club specified"))
                        continue
                    
                    # Check if the club exists in the database, if not, create it
                    club = existing_clubs.get(club_name.lower())
                    if not club:
                        # Create the club if it doesn't exist
                        club = Club(
                            name=club_name,
                            city=club_name.split(' ')[-1]  # Use last word as city name (simplified approach)
                        )
                        club.save()
                        self.stdout.write(self.style.SUCCESS(f"Created new club: {club_name}"))
                        
                        # Update existing_clubs dictionary with the new club
                        existing_clubs[club_name.lower()] = club
                        file_clubs_created += 1
                    
                    processed_clubs.add(club.id)
                    
                    # Check if player already exists (by name only)
                    player_name = player_data.get('name')
                    existing_player = Player.objects.filter(name=player_name, club=club).first()
                    
                    if existing_player:
                        # Skip existing player
                        self.stdout.write(self.style.SUCCESS(f"Skipping existing player: {existing_player}"))
                        file_players_skipped += 1
                        all_processed_players.add(existing_player.id)
                    else:
                        # Create new player
                        player = Player(
                            name=player_name,
                            position=player_data.get('position'),
                            club=club,
                            nationality=player_data.get('country')
                        )
                        player.save()
                        all_processed_players.add(player.id)
                        file_players_created += 1
                        self.stdout.write(self.style.SUCCESS(f"Created player: {player}"))
                
                # Show file summary
                file_summary = f'File {os.path.basename(json_file)}: '
                file_summary += f'Created clubs: {file_clubs_created}, '
                file_summary += f'Created players: {file_players_created}, '
                file_summary += f'Skipped players: {file_players_skipped}'
                self.stdout.write(self.style.SUCCESS(file_summary))
                
                # Update totals
                total_players_created += file_players_created
                total_players_skipped += file_players_skipped
                total_clubs_created += file_clubs_created
                
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'File not found: {json_file}'))
            except json.JSONDecodeError:
                self.stdout.write(self.style.ERROR(f'Invalid JSON format in {json_file}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing {json_file}: {str(e)}'))
        
        # Remove players that aren't in the JSON files
        if processed_clubs:
            for club_id in processed_clubs:
                club = Club.objects.get(id=club_id)
                outdated_players = Player.objects.filter(club=club).exclude(id__in=all_processed_players)
                
                removed_count = outdated_players.count()
                player_names = list(outdated_players.values_list('name', flat=True))
                
                # Delete the outdated players
                outdated_players.delete()
                
                total_players_removed += removed_count
                if removed_count > 0:
                    self.stdout.write(self.style.WARNING(
                        f"Removed {removed_count} players from {club.name}: {', '.join(player_names)}"
                    ))
        
        # Overall summary
        summary = f'OVERALL SUMMARY: Processed {len(json_files)} files. '
        summary += f'Created clubs: {total_clubs_created}, '
        summary += f'Created players: {total_players_created}, '
        summary += f'Skipped players: {total_players_skipped}, '
        summary += f'Removed players: {total_players_removed}'
        self.stdout.write(self.style.SUCCESS(summary))
