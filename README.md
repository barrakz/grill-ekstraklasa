# 🔥 Grill Ekstraklasa

**Grill Ekstraklasa** is a full-stack web application where football fans can **rate, roast, and discuss** players from the Polish Ekstraklasa league. The project was built to demonstrate **real-world software architecture**, full-stack engineering skills, and deployment to production-ready environments.

---

## 🧑‍💻 Built with Purpose

This project was created from scratch to showcase my abilities as a full-stack developer, including backend API design, frontend development, DevOps, cloud integration, and production deployment. It mimics real-world requirements with authentication, media storage, dynamic content, and infrastructure automation.

---

## 🚀 Why This Project Matters

- ✅ End-to-end stack: Django + DRF + Next.js + TypeScript
- ✅ RESTful API with real authentication and permissions
- ✅ CI/CD pipeline with Docker, GitHub Actions, and AWS EC2
- ✅ Image storage integration with AWS S3
- ✅ API documentation using Swagger/OpenAPI
- ✅ Fully responsive, mobile-first UI
- ✅ Search, filtering, and optimized database indexing

---

## ⚙️ Technology Stack

### Backend

- **Framework**: Django 4.2 with Django REST Framework
- **Database**: PostgreSQL 15
- **Authentication**: Token-based auth (DRF tokens)
- **API Documentation**: Swagger/OpenAPI via `drf-yasg`
- **Media Storage**: AWS S3 with `django-storages` and `boto3`
- **Testing**: `pytest`
- **Code Quality**: `black`, `isort`
- **Extras**: Filtering, pagination, Markdown support

### Frontend

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: HeroIcons and custom visuals
- **Linting**: ESLint 9

### DevOps

- **Containerization**: Docker + Docker Compose
- **Deployment**: AWS EC2 with Nginx reverse proxy
- **Server**: Gunicorn (WSGI)
- **Domain**: Custom domain via DuckDNS alternative
- **Environment Configuration**: `python-decouple`
- **CI/CD**: GitHub Actions (auto-deploy on main branch push)
- **Database**: PostgreSQL container with persistent volumes

---

## 🌟 Core Features

- 🧍 **Player Profiles**: Browse Ekstraklasa players
- 🏟️ **Club Pages**: View team squads
- ⭐ **Rating System (1–10)**: Rate players and view real-time averages
- 💬 **Comments**: Post and like user comments
- 🔐 **Authentication**: Register and log in with secure tokens
- 📱 **Responsive Design**: Optimized for mobile devices
- 🔎 **Search & Filter**: Search players by club, name, or position
- 📈 **Performance**: Indexed database queries for fast access

---

## 🧱 Project Structure

This application uses a modular, microservice-like separation of concerns:

- **Backend**: Django REST API organized by apps (auth, players, clubs, comments)
- **Frontend**: Next.js frontend consuming API via typed HTTP clients

---

## 🌍 Live Demo

Visit the app here:  
👉 **[https://grillekstraklasa.pl/](https://grillekstraklasa.pl/)**

---

## 🧠 Skills Demonstrated

- RESTful API design and modular Django architecture
- Secure token-based authentication
- Media file handling in AWS S3 with public/private access
- Deployment pipeline using Docker, GitHub Actions, Nginx, and Gunicorn
- Custom domain setup and production configuration
- Type-safe frontend architecture using React + TypeScript
- Modern UI with Tailwind CSS and HeroIcons
- Swagger API documentation with `drf-yasg`
- Developer tooling and code quality (ESLint, black, isort)

---

## 📚 Dokumentacja

Pełna dokumentacja techniczna projektu znajduje się w folderze [`docs/`](./docs/):

- **[📖 Przegląd Dokumentacji](./docs/README.md)** - Spis treści i szybki start
- **[🏗️ Architektura](./docs/architecture.md)** - Struktura systemu, baza danych, przepływ danych
- **[⚙️ Backend](./docs/backend.md)** - Django REST Framework, modele, API endpoints
- **[🎨 Frontend](./docs/frontend.md)** - Next.js 15, komponenty, routing, SSR
- **[🔌 Referencja API](./docs/api-reference.md)** - Wszystkie endpointy z przykładami
- **[💻 Przewodnik Dewelopera](./docs/development.md)** - Uruchamianie lokalnie, testy, narzędzia
- **[🚀 Deployment i CI/CD](./docs/deployment.md)** - AWS EC2, Nginx, GitHub Actions

---

## 🧪 Automated tests

The project includes a set of unit and API tests covering key backend features:

- Comment model tests (adding a comment)
- API tests for adding a comment (for both logged-in and anonymous users)
- User registration test via API
- Player rating model tests (adding a rating, calculating average)
- API test for fetching the player list

Tests are run on a separate PostgreSQL test database and do not affect production or development data.

To run all tests:

```bash
python manage.py test -v 2
```

---

## 📦 Local Development

```bash
# Backend
cd backend/
docker-compose up --build
# API available at http://localhost:8000/api/

# Frontend
cd frontend/
npm install
npm run dev
# App available at http://localhost:3000
```

---

## ⚖️ License

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License**.

You are welcome to explore and learn from the code, but you **may not use it for commercial purposes, create derivative works, or redistribute it in any form**.

All content and source code in this repository is **© 2025 Bartłomiej Rakuzy**.  
Unauthorized use will be considered a violation of copyright law.

🔗 Full license: [https://creativecommons.org/licenses/by-nc-nd/4.0/](https://creativecommons.org/licenses/by-nc-nd/4.0/)
