# 📚 Grill Ekstraklasa

**Grill Ekstraklasa** to aplikacja webowa dla kibiców Ekstraklasy, która pozwala oceniać piłkarzy, komentować ich występy i śledzić rankingi oparte o głosy społeczności.

## ⭐ Funkcjonalnosci
- Oceny pilkarzy w skali 1–10
- Rankingi i zestawienia najlepszych zawodnikow
- Profile pilkarzy z danymi, statystykami i komentarzami
- Komentarze kibicow wraz z reakcjami
- Lista klubow i filtrowanie pilkarzy po klubie
- Strony informacyjne (o aplikacji, kontakt)

## 🧱 Architektura w skrocie

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

## 🧰 Tech stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Django 4.2 + Django REST Framework
- **Baza danych**: PostgreSQL 15
- **Storage**: AWS S3 (media)
- **Infrastruktura**: AWS EC2 + Nginx + systemd

## 📌 Dokumentacja techniczna
Jesli potrzebujesz szczegolow technicznych, skorzystaj z ponizszych dokumentow:
- [Frontend](./front/README.md)
- [Backend](./backend.md)
- [Architektura](./architecture.md)
- [Referencja API](./api-reference.md)
- [Deployment i CI/CD](./deployment.md)

## 📞 Kontakt
**Autor**: Bartłomiej Rakuzy  
**Licencja**: CC BY-NC-ND 4.0
