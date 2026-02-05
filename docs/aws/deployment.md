# Deployment i aktualizacje (manualne)

Ten dokument opisuje reczny update na serwerze. CI/CD jest opisane w `docs/deployment.md`.
Uwaga: `EC2_PUBLIC_IP` to aktualny publiczny IP z AWS Console, a klucz jest w `~/.ssh/grill-ekstraklasa-2026-01-25`.

## Aktualizacja backendu
```bash
# 1. Polacz sie z serwerem
ssh -i ~/.ssh/grill-ekstraklasa-2026-01-25 ec2-user@EC2_PUBLIC_IP

# 2. Przejdz do katalogu projektu
cd /home/ec2-user/grill-ekstraklasa

# 3. Pobierz zmiany z Git
git pull origin main

# 4. Aktywuj virtual environment
cd backend
source venv/bin/activate

# 5. Zainstaluj/zaktualizuj zaleznosci
pip install -r requirements.txt

# 6. Uruchom migracje
python manage.py migrate

# 7. Zbierz pliki statyczne
python manage.py collectstatic --noinput

# 8. Restart uslugi
sudo systemctl restart grill_ekstraklasa.service

# 9. Sprawdz status
sudo systemctl status grill_ekstraklasa.service
```

## Aktualizacja frontendu
```bash
# 1. Polacz sie z serwerem
ssh -i ~/.ssh/grill-ekstraklasa-2026-01-25 ec2-user@EC2_PUBLIC_IP

# 2. Przejdz do katalogu projektu
cd /home/ec2-user/grill-ekstraklasa

# 3. Pobierz zmiany z Git
git pull origin main

# 4. Przejdz do frontendu
cd frontend

# 5. Zainstaluj zaleznosci
npm install

# 6. Zbuduj aplikacje
npm run build

# 7. Restart uslugi
sudo systemctl restart grill-frontend.service

# 8. Sprawdz status
sudo systemctl status grill-frontend.service
```
