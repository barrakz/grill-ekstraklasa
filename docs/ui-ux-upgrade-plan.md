# UI/UX upgrade — narzędzia AI i strategia dla Grill Ekstraklasa

## Cel

Szybko poprawić jakość UX i wygląd kluczowych ekranów, bez przepisywania logiki.
Dokument jest zrobiony tak, aby kolejny agent AI mógł od razu wejść, wygenerować layouty i wdrożyć je do repo.

## Narzędzia AI do generowania frontu (ranking dla tego przypadku)

1. v0.dev (Vercel) — PRIORYTET
- Wklejasz screenshot swojej strony + opisujesz co chcesz zmienić.
- Generuje gotowy kod React/Next.js/Tailwind.
- Iterujesz promptami: "zrób to bardziej agresywne, piłkarskie, ciemny motyw".
- Output wklejasz do Codexa, który to wdraża.
- Darmowy w podstawowej wersji.
- URL: https://v0.dev

2. Google Stitch
- Dobry do projektowania całych ekranów od zera.
- Eksportuje do Figmy lub kodu.
- Słabszy przy ulepszaniu istniejącego projektu.
- Wart sprawdzenia, ale na drugim miejscu.

3. Lovable.dev / Bolt.new
- Piszesz co chcesz, generuje całą apkę.
- Lepsze do nowych projektów niż do iterowania na istniejącym.
- Możesz użyć do prototypowania nowych podstron.

## Jak działać z v0 + Codex (workflow)

1. Wejdź na v0.dev.
2. Wklej screenshot strony, którą chcesz ulepszyć.
3. Napisz prompt (przykład poniżej).
4. Iteruj aż będzie git.
5. Skopiuj kod i wklej Codexowi z poleceniem "wdróż to do projektu".

Przykładowy prompt do v0 dla strony meczu:

```
Ulepsz ten layout strony meczu piłkarskiego. Portal dla kibiców Ekstraklasy.
Styl: ciemny, agresywny, kibicowski. Duży wynik na środku.
Sekcja składu poniżej. Mobile-first. Tailwind CSS, Next.js.
Zachowaj strukturę danych, zmień tylko wizualną warstwę.
```

## Zasady zatrzymywania użytkownika — psychologia i UX

Pierwsze 3 sekundy są wszystkim
Użytkownik decyduje czy zostaje w ciągu 3 sekund. Na portalu pierwsze co widzi musi odpowiadać na pytanie "co tu dla mnie jest".
Co zmienić: nad foldem (bez scrollowania) musi być nazwa portalu + jedno zdanie co to jest + coś live/aktywnego (np. ostatnia ocena, live wynik, "X kibiców oceniło dziś").

Social proof działa natychmiast
Liczby przekonują. "1,243 ocen kibiców" albo "Oceniono 87 zawodników w tej kolejce" — to zatrzymuje.
Nie musisz mieć milionów userów, ważne żeby cokolwiek się ruszało i było widoczne.

Pętla zaangażowania (hook model)
Kibic wchodzi → widzi oceny innych → ma opinię → chce zagłosować → głosuje → wraca sprawdzić czy jego ocena się zmieniła.
Każdy krok musi być maksymalnie łatwy. Jeden klik do zagłosowania, bez rejestracji na start jeśli możliwe.

Powiadomienia i powroty
Najsilniejszy mechanizm powrotu to "coś się zmieniło od kiedy byłeś". Możliwości:
- "Od Twojej ostatniej wizyty oceniono 12 zawodników"
- Push notyfikacje (PWA) przy nowych meczach
- Prosty newsletter "oceny po meczu" — jeden mail po każdej kolejce

Gamifikacja — prosto
Nie potrzebujesz skomplikowanego systemu. Wystarczy:
- Ranking "top komentatorów tygodnia"
- Odznaka dla użytkowników którzy ocenili cały skład
- "Twoja ocena vs średnia kibiców" po zagłosowaniu

Mobile first — nie mobile also
Kibice oglądają mecze na telefonie. Jeśli strona meczu nie wygląda świetnie na mobile to tracisz 70% ruchu.
Sprawdź to teraz na telefonie i zobaczysz co boli najbardziej.

## Konkretne rzeczy do poprawienia na Grill Ekstraklasa (na oko)

- Strona meczu: wynik powinien być OGROMNY, centralny, nie schowany — to główna informacja.
- Lista meczów: dodaj miniaturki herbów klubów większe, więcej koloru, mniej tabeli a więcej kart.
- Homepage: sekcja "najnowsze dramaty" powinna być pierwszą rzeczą — to wyróżnik i hak emocjonalny.
- Komentarze: pokaż je wcześniej, wyżej — UGC to dowód że tu żyje społeczność.
- CTA (call to action): "Oceń tego zawodnika" musi być button, nie link, duży i widoczny.

## Stack techniczny — jak wdrażać bez pisania kodu

v0.dev → generuje komponenty React/Tailwind
↓
Codex → wdraża do repo, integruje z istniejącymi danymi
↓
GitHub Actions → auto deploy na EC2
↓
grillekstraklasa.pl

Jeśli nie masz jeszcze CI/CD na EC2 — zapytaj Codexa o setup GitHub Actions → EC2 deploy.
To jeden plik .yml i nigdy więcej ręcznego deployu.

## Priorytety — co robić najpierw

- v0.dev — wygeneruj nowy layout strony meczu (największy impact, core produktu).
- Homepage hook — sekcja "dramaty tygodnia" jako pierwsze co widać.
- Mobile — sprawdź i napraw layout na telefonie.
- Social proof — dodaj liczniki aktywności gdziekolwiek możesz.
- CI/CD — żeby nie deployować ręcznie z EC2.

## Materiały warte przejrzenia

- https://v0.dev — zacznij tu
- "Hook Model" Nir Eyal — książka/artykuły o angażowaniu użytkowników (krótkie summary na YouTube)
- https://lawsofux.com — zasady UX w pigułce, każda z przykładem
