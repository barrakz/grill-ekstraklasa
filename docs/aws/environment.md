# Zmienne srodowiskowe

Backend korzysta z pliku `.env` w `/home/ec2-user/grill-ekstraklasa/backend/.env`.

**Przykladowe zmienne** (bez wrazliwych danych):
```env
DEBUG=False
DB_NAME=ekstraklasa
DB_USER=grilluser
DB_HOST=localhost
DB_PORT=5432
```

> [!CAUTION]
> Plik `.env` zawiera wrazliwe dane (hasla, klucze API). Nigdy nie commituj go do repozytorium.
