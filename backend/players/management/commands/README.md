"""
# Player Import Script Documentation

This script allows you to import, update, and synchronize player data from JSON files into the database.
It supports club-specific JSON files and can handle multiple clubs at once.

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

### Combine options:
```
python manage.py import_players --all --create-clubs --sync
```

## File Naming Conventions

The script looks for club-specific JSON files in the 'data' directory.
Files should be named according to the club name with spaces removed:
- Widzew Łódź → widzew.json or widzewłódź.json
- Arka Gdynia → arka.json or arkagdynia.json

## JSON File Format

Each JSON file should contain an array of player objects with the following fields:
```json
[
  {
    "name": "Player Name",
    "position": "GK", // One of: GK, DF, MF, FW
    "country": "Country Name",
    "club": "Club Name"
  },
  // more players...
]
```

## Behavior Notes

1. Existing clubs are never modified
2. Players are identified by their name and club
3. If a player exists:
   - Their data (position, nationality) will be updated if it differs from the JSON
   - No changes are made if the data is identical
4. If a player doesn't exist, they will be created
5. Players in the database but not in the JSON:
   - With --sync: They'll be marked as inactive (if model has is_active field)
   - With --remove: They'll be deleted from the database
   - Without these options: They'll remain unchanged

## Examples

### Initial import of all Widzew Łódź players:
```
python manage.py import_players --club "Widzew Łódź" --create-clubs
```

### Update roster after summer transfers:
```
python manage.py import_players --club "Widzew Łódź" --sync
```

### Complete database rebuild:
```
python manage.py import_players --all --create-clubs --remove
```

### Running in Docker:
```
docker exec -it grill-backend python manage.py import_players --all --create-clubs
```
"""
