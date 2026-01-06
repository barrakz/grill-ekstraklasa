# 🎨 Styling i design tokens

Frontend korzysta z Tailwind CSS 4 i dodatkowych klas zdefiniowanych w `frontend/src/app/globals.css`.

## 🖋️ Typografia
- **Manrope**: font bazowy (`--font-body`)
- **Space Grotesk**: naglowki i elementy display (`--font-display`)

Fonty sa deklarowane w `frontend/src/app/layout.tsx` i wstrzykiwane jako CSS variables.

## 🎛️ Tokeny kolorow
W `globals.css` zdefiniowane sa podstawowe tokeny, m.in.:
- `--primary-bg`, `--secondary-bg`, `--accent-color`, `--accent-hover`
- `--text-light`, `--text-muted`, `--border-color`

## 🧩 Klasy globalne
Najczesciej uzywane klasy niestandardowe:
- `card` - karty z cieniem i delikatnym borderem
- `accent-button` - gradientowy przycisk CTA
- `player-card` - karty pilkarzy na listach
- `rating-star` i `star-rating-button` - oceny gwiazdkowe
- `filter-button` - aktywne/inaktywne filtry
- `reveal`, `reveal-delay-*` - animacje wejscia sekcji

## 🌥️ Tlo i animacje
Tlo strony sklada sie z warstwowego gradientu radialnego + linearnego. Animacje sekcji sa zdefiniowane w `@keyframes fade-up` i wykorzystywane w klasach `reveal`.
