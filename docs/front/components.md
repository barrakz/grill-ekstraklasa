# 🧩 Komponenty i UI

## 🧱 Layout i nawigacja
- `ClientLayout.tsx` - navbar, logowanie/rejestracja, stopka
- `LoginForm.tsx` - logowanie w navbarze (mobile/desktop layout)
- `RegisterForm.tsx` - modal rejestracji uruchamiany z layoutu

## 🏠 Strona glowna
- `TopPlayersTable.tsx` + `players/PlayerTableRow.tsx`
- `LatestComments.tsx`
- `ClubCard.tsx`

## 👥 Lista pilkarzy
- `players/PlayersPageWrapper.tsx` - filtrowanie, grupowanie po pozycjach
- `ClubSelect.tsx` - selektor klubow (w innych widokach)
- `Pagination.tsx` - paginacja list
- `ClubLatestComments.tsx` - komentarze powiazane z klubem

## 🧑‍💼 Profil pilkarza
- `PlayerDetails.tsx` - pobieranie danych, obsluga bledow i sekcji
- `player/PlayerProfile.tsx` - lewa kolumna profilu
- `player/PlayerRatingSection.tsx` - oceny i statystyki
- `player/CommentsSection.tsx` - komentarze i ich obsluga
- `CommentForm.tsx`, `RatingForm.tsx` - akcje uzytkownika

## 💬 Komentarze
- `comments/CommentItem.tsx` - pojedynczy komentarz
- `comments/CommentSorting.tsx` - sortowanie i filtry
- `comments/CommentsPagination.tsx` - paginacja komentarzy

## 🧰 UI wspolne
- `common/Button.tsx` - przyciski wielowariantowe
- `form/InputField.tsx` i `form/FormButton.tsx` - pola formularzy

Komponenty sa podzielone tematycznie, zeby latwiej utrzymywac nowy layout i system wizualny.
