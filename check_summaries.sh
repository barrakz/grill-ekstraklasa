#!/bin/bash

echo "=== Sprawdzanie ile zawodników ma summary ==="
docker exec grill-postgres psql -U postgres -d grill_db -c "SELECT COUNT(*) as total_players, COUNT(summary) as with_summary FROM players_player;"

echo ""
echo "=== Lista zawodników z długością summary ==="
docker exec grill-postgres psql -U postgres -d grill_db -c "SELECT name, CASE WHEN summary IS NULL THEN 'NULL' WHEN summary = '' THEN 'EMPTY' ELSE LENGTH(summary)::text || ' chars' END as summary_status FROM players_player ORDER BY name;"

echo ""
echo "=== Przykładowy summary (pierwszy zawodnik) ==="
docker exec grill-postgres psql -U postgres -d grill_db -c "SELECT name, LEFT(summary, 200) as summary_preview FROM players_player WHERE summary IS NOT NULL AND summary != '' LIMIT 1;"
