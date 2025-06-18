"""
# Player Import Script Documentation

This simplified script automatically imports, updates, and synchronizes player data from JSON files into the database.

## Basic Usage

Run the command without any parameters to process all JSON files:
```
python manage.py import_players
```

Or specify a specific JSON file to process:
```
python manage.py import_players widzew.json
```

You can also skip the .json extension:
```
python manage.py import_players widzew
```

## Key Features

- Automatically processes all JSON files in the 'data' directory (or a specific file if provided)
- Creates clubs if they don't exist in the database
- Skips players that already exist (checking only by name)
- Removes players from the database that aren't in the JSON files

## File Naming Conventions

The script looks for JSON files in the 'data' directory. Files are typically named after clubs:
- widzew.json or widzewłódź.json
- arka.json or arkagdynia.json

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

1. Clubs are automatically created if they don't exist in the database
2. Players are identified by their name and club
3. If a player already exists in the database, they are skipped
4. New players are created if they don't exist
5. Players in the database but not in the JSON files are automatically deleted

## Examples

### Process all files:
```
python manage.py import_players
```

### Process specific club file:
```
python manage.py import_players widzew
```

### Running in Docker:
```
docker exec -it grill-backend python manage.py import_players
```

### Process specific club file in Docker:
```
docker exec -it grill-backend python manage.py import_players legiawarszawa
```
"""
