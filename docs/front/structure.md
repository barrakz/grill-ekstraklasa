# 📁 Struktura projektu

Poniższa struktura odzwierciedla aktualny układ frontendu po zmianach na galezi `new-front`.

```text
frontend/
├── src/
│   └── app/
│       ├── about/
│       │   └── page.tsx
│       ├── api/
│       │   ├── redirect/route.ts
│       │   └── revalidate/route.ts
│       ├── clubs/
│       │   └── page.tsx
│       ├── components/
│       │   ├── comments/
│       │   │   ├── CommentItem.tsx
│       │   │   ├── CommentSorting.tsx
│       │   │   └── CommentsPagination.tsx
│       │   ├── common/
│       │   │   └── Button.tsx
│       │   ├── form/
│       │   │   ├── FormButton.tsx
│       │   │   └── InputField.tsx
│       │   ├── player/
│       │   │   ├── CommentsSection.tsx
│       │   │   ├── PlayerProfile.tsx
│       │   │   └── PlayerRatingSection.tsx
│       │   ├── players/
│       │   │   └── PlayerTableRow.tsx
│       │   ├── ClientLayout.tsx
│       │   ├── ClubCard.tsx
│       │   ├── ClubLatestComments.tsx
│       │   ├── ClubSelect.tsx
│       │   ├── CommentForm.tsx
│       │   ├── LatestComments.tsx
│       │   ├── LoginForm.tsx
│       │   ├── Pagination.tsx
│       │   ├── PlayerDetails.tsx
│       │   ├── RatingForm.tsx
│       │   ├── RegisterForm.tsx
│       │   └── TopPlayersTable.tsx
│       ├── contact/
│       │   └── page.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── lib/
│       ├── players/
│       │   ├── PlayersPageWrapper.tsx
│       │   ├── page.tsx
│       │   └── [slug]/page.tsx
│       ├── services/
│       ├── types/
│       │   ├── comment.ts
│       │   └── player.ts
│       ├── config.ts
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 🧭 Najwazniejsze katalogi
- `app/components/` - warstwa UI podzielona na sekcje (player, comments, form, common).
- `app/players/` - lista graczy + szczegoly pod slugiem.
- `app/clubs/` - lista klubow i wejście do filtrowanej listy graczy.
- `app/hooks/` - hooki klientowe (np. `useAuth`).
- `app/types/` - interfejsy TypeScript dla danych API.
- `app/config.ts` - wspolne stale konfiguracyjne (np. `API_BASE_URL`).
