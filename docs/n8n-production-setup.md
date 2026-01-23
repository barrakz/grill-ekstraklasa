# Konfiguracja n8n z Produkcyjną Bazą Danych

Ta instrukcja opisuje, jak połączyć lokalną instancję n8n z produkcyjną bazą danych PostgreSQL na serwerze AWS, aby generować opisy dla piłkarzy.

## 1. Pobranie Danych Dostępowych do Bazy

Najpierw musisz uzyskać hasło do bazy danych z pliku `.env` na serwerze.
Uwaga: `EC2_PUBLIC_IP` to aktualny publiczny IP z AWS Console, a klucz jest w `~/.ssh/edbnew.pem`.

1. Połącz się z serwerem przez SSH:
   ```bash
   ssh -i ~/.ssh/edbnew.pem ec2-user@EC2_PUBLIC_IP
   ```

2. Wyświetl zawartość pliku `.env` (szukaj `DB_PASSWORD`):
   ```bash
   cat /home/ec2-user/grill-ekstraklasa/backend/.env
   ```
   Zapisz sobie wartość `DB_PASSWORD`. Pozostałe dane to zazwyczaj:
   - **User**: `grilluser`
   - **Database**: `ekstraklasa`

## 2. Ustawienie Tunelu SSH

Ze względów bezpieczeństwa baza danych nie jest wystawiona publicznie. Aby się do niej połączyć z lokalnego n8n, należy zestawić tunel SSH.

Uruchom poniższą komendę w nowym terminalu na swoim komputerze (nie zamykaj go, dopóki pracujesz z n8n):

```bash
ssh -i ~/.ssh/edbnew.pem -L 5433:localhost:5432 ec2-user@EC2_PUBLIC_IP -N
```

**Wyjaśnienie flag:**
- `-L 5433:localhost:5432`: Przekierowuje lokalny port `5433` na port `5432` (PostgreSQL) na serwerze zdalnym (localhost z perspektywy serwera). Używamy `5433`, aby nie kolidować z lokalnym Postgresem na porcie `5432`.
- `-N`: Nie uruchamia powłoki (shell), tylko zestawia tunel.

## 3. Konfiguracja Węzła Postgres w n8n

W n8n, w węźle Postgres (lub w Credentials), skonfiguruj połączenie następująco:

- **Host**: `localhost`
- **Port**: `5433` (port tunelu)
- **Database**: `ekstraklasa`
- **User**: `grilluser`
- **Password**: (hasło pobrane w kroku 1)
- **SSL**: Off (tunel SSH zapewnia szyfrowanie)

## 4. Weryfikacja

1. W n8n uruchom testowy węzeł Postgres z prostym zapytaniem, np.:
   ```sql
   SELECT count(*) FROM players_player;
   ```
2. Jeśli otrzymasz wynik, połączenie działa poprawnie.

## 5. Generowanie Opisów

Teraz możesz uruchomić swój workflow generowania opisów. Pamiętaj, że operujesz na **produkcyjnej** bazie danych, więc zachowaj ostrożność.

### Wskazówki:
- Upewnij się, że workflow aktualizuje tylko pole `summary`.
- Możesz najpierw przetestować na jednym zawodniku, dodając warunek `WHERE name = 'Jan Kowalski'`.
