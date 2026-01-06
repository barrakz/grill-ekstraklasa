# Architektura aplikacji

## Stack technologiczny

### Backend (Django)
- **Python**: 3.9.20
- **Framework**: Django 4.2.20
- **WSGI Server**: Gunicorn 23.0.0
- **Baza danych**: PostgreSQL (lokalnie)
- **Lokalizacja**: `/home/ec2-user/grill-ekstraklasa/backend`
- **Virtual Environment**: `/home/ec2-user/grill-ekstraklasa/backend/venv`

### Frontend (Next.js)
- **Node.js**: v18.20.7
- **npm**: 10.8.2
- **Framework**: Next.js 15.4.6
- **Lokalizacja**: `/home/ec2-user/grill-ekstraklasa/frontend`

### Web Server
- **Nginx**: Reverse proxy i SSL termination
- **SSL/TLS**: Let's Encrypt (certbot)

## Porty i ruch
- **80/443**: Nginx (publicznie)
- **3000**: Next.js (lokalnie)
- **8000**: Django/Gunicorn (lokalnie)
- **5432**: PostgreSQL (lokalnie)
