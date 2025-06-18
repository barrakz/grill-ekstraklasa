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
    
    ## Basic Usage

    ### Import players from a specific file:
    ```
    python manage.py import_players --file data/widzew.json
    ```

    ### Import players from a specific club (automatically finds the club's JSON file):
    ```
    python manage.py import_players --club "Widzew Łódź"
    ```

    ### Import players from all JSON files in the data directory:
    ```
    python manage.py import_players --all
    ```

    ## Advanced Options

    ### Create clubs if they don't exist:
    ```
    python manage.py import_players --club "Widzew Łódź" --create-clubs
    ```

    ### Synchronize club roster (mark players not in JSON as inactive):
    ```
    python manage.py import_players --club "Widzew Łódź" --sync
    ```

    ### Remove players that are not in the JSON file:
    ```
    python manage.py import_players --club "Widzew Łódź" --remove
    ```

    ### Running in Docker:
    ```
    docker exec -it grill-backend python manage.py import_players --all --create-clubs
    ```
    """
    
    help = 'Import players from JSON file to database and update existing players'
    
    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to a specific JSON file')
        parser.add_argument('--all', action='store_true', help='Import all JSON files from the data directory')
        parser.add_argument('--club', type=str, help='Import only players from specific club')
        parser.add_argument('--create-clubs', action='store_true', help='Create clubs if they don\'t exist')
        parser.add_argument('--sync', action='store_true', help='Sync club roster - mark players not in JSON as inactive')
        parser.add_argument('--remove', action='store_true', help='Remove players that are not in JSON file')

    @transaction.atomic
    def handle(self, *args, **options):
        file_path = options.get('file')
        club_filter = options.get('club')
        create_clubs = options.get('create_clubs', False)
        sync_mode = options.get('sync', False)
        remove_mode = options.get('remove', False)
        import_all = options.get('all', False)
        
        # Define base directory for JSON files
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        data_dir = os.path.join(base_dir, 'data')
        
        # Get files to process
        json_files = []
        
        if import_all:
            # Get all JSON files in data directory
            json_pattern = os.path.join(data_dir, '*.json')
            json_files = glob.glob(json_pattern)
            self.stdout.write(self.style.SUCCESS(f'Found {len(json_files)} JSON files to process'))
        elif file_path:
            # Process single file
            if not os.path.isabs(file_path):
                file_path = os.path.join(base_dir, file_path)
            json_files = [file_path]
        else:
            # Default to processing club-specific JSON if it exists
            if club_filter:
                # Try to find club-specific JSON file
                club_json = os.path.join(data_dir, f"{club_filter.lower().replace(' ', '')}.json")
                if os.path.exists(club_json):
                    json_files = [club_json]
                    self.stdout.write(self.style.SUCCESS(f'Using club-specific JSON file: {club_json}'))
                else:
                    # Fallback to players.json
                    fallback_file = os.path.join(data_dir, 'players.json')
                    if os.path.exists(fallback_file):
                        json_files = [fallback_file]
                        self.stdout.write(self.style.SUCCESS(f'Using fallback file: {fallback_file}'))
                    else:
                        self.stdout.write(self.style.ERROR(f'No JSON file found for club: {club_filter}'))
                        return
            else:
                # Fallback to players.json if it exists
                fallback_file = os.path.join(data_dir, 'players.json')
                if os.path.exists(fallback_file):
                    json_files = [fallback_file]
                    self.stdout.write(self.style.SUCCESS(f'Using fallback file: {fallback_file}'))
                else:
                    self.stdout.write(self.style.ERROR('No file specified and no default file found. Use --file or --all option.'))
                    return
        
        # Process all files
        total_players_created = 0
        total_players_updated = 0
        total_players_skipped = 0
        total_players_removed = 0
        
        for json_file in json_files:
            self.stdout.write(self.style.SUCCESS(f'Processing file: {json_file}'))
            file_players_created = 0
            file_players_updated = 0
            file_players_skipped = 0
            file_players_removed = 0
            
            try:
                with open(json_file, 'r', encoding='utf-8') as file:
                    players_data = json.load(file)
                    
                self.stdout.write(self.style.SUCCESS(f'Found {len(players_data)} players in the file'))
                
                # Filter by club if specified
                if club_filter:
                    original_count = len(players_data)
                    players_data = [player for player in players_data if player.get('club', '').lower() == club_filter.lower()]
                    self.stdout.write(self.style.SUCCESS(f'Filtered to {len(players_data)} players from {club_filter} (from {original_count})'))
                
                # Track processed players to handle syncing
                processed_players_ids = set()
                processed_clubs = set()
                
                for player_data in players_data:
                    club_name = player_data.get('club')
                    if not club_name:
                        self.stdout.write(self.style.WARNING(f"Skipping player {player_data.get('name')} - no club specified"))
                        file_players_skipped += 1
                        continue
                    
                    # Find the club in the database or create it if it doesn't exist and option is enabled
                    try:
                        club = Club.objects.get(name=club_name)
                        self.stdout.write(self.style.SUCCESS(f"Found existing club: {club_name}"))
                    except Club.DoesNotExist:
                        if create_clubs:
                            # Create the club if it doesn't exist
                            club = Club(
                                name=club_name,
                                city=club_name.split(' ')[-1]  # Use last word as city name (simplified approach)
                            )
                            club.save()
                            self.stdout.write(self.style.SUCCESS(f"Created new club: {club_name}"))
                        else:
                            self.stdout.write(self.style.WARNING(
                                f"Club {club_name} not found in database and --create-clubs not specified. "
                                f"Skipping player {player_data.get('name')}"
                            ))
                            file_players_skipped += 1
                            continue
                    
                    processed_clubs.add(club.id)
                    
                    # Check if player already exists
                    existing_player = Player.objects.filter(name=player_data.get('name'), club=club).first()
                    
                    if existing_player:
                        # Update existing player if needed
                        updated = False
                        if existing_player.position != player_data.get('position'):
                            existing_player.position = player_data.get('position')
                            updated = True
                        
                        if existing_player.nationality != player_data.get('country'):
                            existing_player.nationality = player_data.get('country')
                            updated = True
                        
                        # Add more fields to update as needed
                        
                        if updated:
                            existing_player.updated_at = timezone.now()
                            existing_player.save()
                            file_players_updated += 1
                            self.stdout.write(self.style.SUCCESS(f"Updated player: {existing_player}"))
                        else:
                            self.stdout.write(self.style.SUCCESS(f"Player {existing_player} already up to date"))
                            file_players_skipped += 1
                        
                        processed_players_ids.add(existing_player.id)
                    else:
                        # Create new player
                        player = Player(
                            name=player_data.get('name'),
                            position=player_data.get('position'),
                            club=club,
                            nationality=player_data.get('country')
                        )
                        player.save()
                        processed_players_ids.add(player.id)
                        file_players_created += 1
                        self.stdout.write(self.style.SUCCESS(f"Created player: {player}"))
                
                # Handle syncing - mark players not in JSON as removed or inactive
                if (sync_mode or remove_mode) and processed_clubs:
                    for club_id in processed_clubs:
                        club = Club.objects.get(id=club_id)
                        outdated_players = Player.objects.filter(club=club).exclude(id__in=processed_players_ids)
                        
                        for player in outdated_players:
                            if remove_mode:
                                player_name = player.name
                                player.delete()
                                file_players_removed += 1
                                self.stdout.write(self.style.WARNING(f"Removed player: {player_name} from {club.name}"))
                            elif hasattr(Player, 'is_active'):  # Check if model has is_active field
                                player.is_active = False
                                player.updated_at = timezone.now()
                                player.save()
                                file_players_removed += 1
                                self.stdout.write(self.style.WARNING(f"Marked player as inactive: {player}"))
                
                # Update totals
                total_players_created += file_players_created
                total_players_updated += file_players_updated
                total_players_skipped += file_players_skipped
                total_players_removed += file_players_removed
                
                # Show file summary
                file_summary = f'File {os.path.basename(json_file)}: '
                file_summary += f'Created: {file_players_created}, '
                file_summary += f'Updated: {file_players_updated}, '
                if remove_mode:
                    file_summary += f'Removed: {file_players_removed}, '
                elif sync_mode:
                    file_summary += f'Marked inactive: {file_players_removed}, '
                file_summary += f'Skipped: {file_players_skipped}'
                self.stdout.write(self.style.SUCCESS(file_summary))
                
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'File not found: {json_file}'))
            except json.JSONDecodeError:
                self.stdout.write(self.style.ERROR(f'Invalid JSON format in {json_file}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing {json_file}: {str(e)}'))
        
        # Overall summary
        if len(json_files) > 1:
            summary = f'OVERALL SUMMARY: Processed {len(json_files)} files. '
            summary += f'Created: {total_players_created}, '
            summary += f'Updated: {total_players_updated}, '
            if remove_mode:
                summary += f'Removed: {total_players_removed}, '
            elif sync_mode:
                summary += f'Marked inactive: {total_players_removed}, '
            summary += f'Skipped: {total_players_skipped}'
            self.stdout.write(self.style.SUCCESS(summary))
