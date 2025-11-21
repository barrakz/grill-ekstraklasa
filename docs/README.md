# 📚 Dokumentacja Grill Ekstraklasa

Witaj w dokumentacji technicznej projektu **Grill Ekstraklasa** - aplikacji webowej do oceniania i komentowania piłkarzy Ekstraklasy.

## 📖 Spis Treści

### 🏗️ [Architektura Projektu](./architecture.md)
Przegląd architektury systemu, struktura bazy danych, przepływ danych i integracje zewnętrzne.

### ⚙️ [Backend - Django REST Framework](./backend.md)
Szczegółowa dokumentacja backendu: modele, API endpoints, autentykacja, sygnały i konfiguracja AWS S3.

### 🎨 [Frontend - Next.js](./frontend.md)
Dokumentacja frontendu: struktura projektu, routing, komponenty UI, integracja z API.

### 🔌 [Referencja API](./api-reference.md)
Kompletna dokumentacja wszystkich endpointów API z przykładami requestów i odpowiedzi.

### 💻 [Przewodnik Dewelopera](./development.md)
Instrukcje uruchamiania projektu lokalnie, konfiguracja środowiska, testy i narzędzia deweloperskie.

### 🚀 [Deployment i CI/CD](./deployment.md)
Dokumentacja wdrożenia na AWS EC2, konfiguracja Nginx, proces CI/CD z GitHub Actions.

### ☁️ [Konfiguracja Serwera AWS](./aws-server-configuration.md)
Szczegółowa dokumentacja konfiguracji serwera produkcyjnego: systemd services, nginx, SSL, procesy, monitoring i troubleshooting.

---

## 🚀 Szybki Start

### Wymagania
- Docker i Docker Compose
- Node.js 18+ (dla frontendu)
- Git

### Uruchomienie Lokalne

```bash
# Sklonuj repozytorium
git clone https://github.com/yourusername/grill-ekstraklasa.git
cd grill-ekstraklasa

# Backend (Django + PostgreSQL)
docker-compose up --build

# Frontend (Next.js) - w nowym terminalu
cd frontend
npm install
npm run dev
```

Backend dostępny pod: `http://localhost:8000/api/`  
Frontend dostępny pod: `http://localhost:3000`

Szczegółowe instrukcje znajdziesz w [Przewodniku Dewelopera](./development.md).

---

## 🏛️ Architektura w Skrócie

```
┌─────────────┐      HTTP/REST      ┌──────────────┐
│   Next.js   │ ◄─────────────────► │    Django    │
│  Frontend   │                     │   REST API   │
└─────────────┘                     └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ PostgreSQL   │
                                    │   Database   │
                                    └──────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │   AWS S3     │
                                    │ Media Storage│
                                    └──────────────┘
```

---

## 📝 Najważniejsze Informacje

- **Backend**: Django 4.2 + Django REST Framework
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Baza danych**: PostgreSQL 15
- **Autentykacja**: Token-based (DRF Token Auth)
- **Storage**: AWS S3 dla zdjęć
- **Deployment**: AWS EC2 + Nginx + Gunicorn
- **CI/CD**: GitHub Actions (auto-deploy na push do main)

---

## 🤝 Dla Developerów

Jeśli chcesz przyczynić się do rozwoju projektu:

1. Zapoznaj się z [Przewodnikiem Dewelopera](./development.md)
2. Przeczytaj [Dokumentację Architektury](./architecture.md)
3. Sprawdź [Referencję API](./api-reference.md)

---

## 📞 Kontakt

W razie pytań lub problemów, sprawdź dokumentację lub otwórz issue na GitHubie.

**Autor**: Bartłomiej Rakuzy  
**Licencja**: CC BY-NC-ND 4.0
