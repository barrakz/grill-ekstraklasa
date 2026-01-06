# 🔐 Autentykacja

## useAuth
Hook `frontend/src/app/hooks/useAuth.ts` trzyma stan uzytkownika w `localStorage` pod kluczem `user`.

**Struktura uzytkownika:**
- `id`
- `username`
- `token`

## Logowanie
`LoginForm.tsx` korzysta z `useAuth.login()`, ktory wysyla:
- `POST /api/auth/login/`
- `Content-Type: application/json`
- `credentials: include`

Po sukcesie zapisuje token w `localStorage` i aktualizuje stan w hooku.

## Rejestracja
`RegisterForm.tsx` wywoluje `useAuth.register()` i zapisuje dane uzytkownika identycznie jak przy logowaniu.

## Wylogowanie
`logout()` czysci wpis `user` z `localStorage` i resetuje stan.

## Uzycie tokenu
Token jest wykorzystywany do:
- oceniania pilkarzy (`/api/players/:slug/rate/`)
- dodawania komentarzy (`/api/players/:slug/comment/`)
