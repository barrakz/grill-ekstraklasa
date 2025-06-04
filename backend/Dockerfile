# 1. Bazowy obraz z Pythonem
FROM python:3.11-slim

# 2. Doinstaluj narzędzia systemowe: psql, ping, kompilator itp.
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    postgresql-client iputils-ping \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. Ustaw katalog roboczy
WORKDIR /app

# 4. Skopiuj requirements
COPY requirements.txt ./

# 5. Instaluj zależności Pythona
RUN pip install --no-cache-dir -r requirements.txt

# 6. Skopiuj cały projekt
COPY . .

# 7. Dodaj uprawnienia do skryptu oczekiwania na bazę danych
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# 8. Expose i CMD
EXPOSE 8000
CMD ["/wait-for-postgres.sh", "db", "python", "manage.py", "runserver", "0.0.0.0:8000"]
