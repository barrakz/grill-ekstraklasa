# Analiza UI/UX — Grill Ekstraklasa (marzec 2026)

⚠️ Uwaga: Poniższa analiza dotyczy wyłącznie widoku desktop.
Szacowany ruch mobile to ~99% użytkowników portalu.
Analiza mobile jest do zrobienia osobno — wymaga screenshotów z telefonu.
Priorytety i oceny poniżej mogą się zmienić po analizie mobile.

## Co się udało — zostawiamy i rozwijamy

Strona meczu — najlepsza część portalu
Ciemny header z wynikiem i logotypami drużyn wygląda profesjonalnie.
Kafelki ze statystykami (termin, sezon, głosy, dom, wyjazd) są czytelne i dobrze ułożone.
Sekcja składu z przyciskami 1–10 kolorowanymi czerwony/zielony jest intuicyjna — użytkownik od razu wie co robić.
To jest core produktu i wygląda jak core produktu. Dobra robota.

Sekcja "Największe dramaty tygodnia"
Karty z twarzą zawodnika, dużą oceną i nazwą klubu — dokładnie to powinno być głównym hakiem portalu.
Jest już na homepage, co jest słuszne.

Widget "Aktualnie najniższe oceny" (prawy górny róg)
Dobry pomysł i dobra pozycja — natychmiastowy social proof dla nowego użytkownika.

## Co nie działa — do naprawienia

1. Homepage — układ zbyt korporacyjny
Dwukolumnowy układ (nagłówek + "Jak to działa" obok siebie) wygląda jak landing page SaaS, nie jak kibicowski portal.
Sekcja "Jak to działa" z 3 krokami jest zbędna dla kogoś kto przyszedł ocenić piłkarza — usuń ją z homepage albo schowaj na dół.
Fix: Hero section = karta z aktualnym dramatem, duża ocena, twarz zawodnika, button "Oceń teraz". Zero instrukcji.

2. Czerwony button "ZAGŁOSUJ TERAZ..."
Dobry pomysł, zła egzekucja. Pełny czerwony prostokąt na całą szerokość strony wygląda jak baner reklamowy.
Fix: Węższy button z ikoną 🔥, wyśrodkowany, z lekkim cieniem. Nie fullwidth.

3. Strona /mecze — ogromny hero do wywalenia
Blok "Ekstraklasa mecz po meczu — składy i noty w jednym miejscu" zajmuje połowę ekranu.
Kibic który wchodzi na /mecze wie czego szuka. Nie potrzebuje opisu strony.
Fix: Usuń hero całkowicie. Zacznij od razu od "Najbliższe mecze" z dużym nagłówkiem sekcji.

4. Navbar z polami logowania
Login i hasło jako pola tekstowe wbudowane w górny pasek nawigacji to archaiczny pattern.
Wygląda nieprofesjonalnie i zajmuje cenne miejsce w headerze.
Fix: Jeden button "Zaloguj" otwierający modal. Standardowy pattern, czystszy header.

5. Widget "Aktualnie najniższe oceny" — za mały
Jest w dobrym miejscu (prawy górny róg) ale jest za mały i za mało widoczny.
Nowy użytkownik może go w ogóle nie zauważyć.
Fix: Większe karty, większa czcionka dla oceny, może sticky żeby nie znikał przy scrollowaniu.

## Priorytety do wdrożenia (kolejność)

1. Navbar — zamień pola login/hasło na button "Zaloguj" z modalem (małe, duży efekt wizualny)
2. Strona /mecze — usuń hero, zacznij od listy meczów (5 minut dla Codexa)
3. Homepage hero — zamień dwukolumnowy układ na kartę z aktualnym dramatem
4. Czerwony button — zmniejsz, wystyluj lepiej
5. Widget najniższych ocen — powiększ i rozważ sticky

## Ogólna ocena

Strona meczu: 8/10 — wygląda profesjonalnie, funkcjonalna, dobry dark mode header.
Homepage: 5/10 — dobra zawartość w złej kolejności i złym układzie.
Strona /mecze: 4/10 — hero blokuje dostęp do treści.
Navbar: 4/10 — pola logowania w headerze to do zmiany w pierwszej kolejności.
