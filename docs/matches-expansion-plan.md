# Plan rozwoju modulu meczowego

Uwaga: ten dokument opisuje plan historyczny. Aktualny stan i instrukcja operacyjna są tutaj:

- [docs/matches-mvp-implementation.md](/Users/brakuzy/Code/personal/grill-ekstraklasa/docs/matches-mvp-implementation.md)

## Kontekst

Status implementacji MVP i instrukcja rollbacku sa opisane tutaj:

- [docs/matches-mvp-implementation.md](/Users/brakuzy/Code/personal/grill-ekstraklasa/docs/matches-mvp-implementation.md)

Przeczytalem dokument `grillekstraklasa-growth-plan.html`. Jego glowna teza jest trafna: Grill Ekstraklasa powinien przejsc z modelu "ogladam profile pilkarzy" do modelu "rozliczam konkretny mecz tuz po gwizdku".

To oznacza jedna glowna decyzje produktowa na 90 dni:

- rdzeniem produktu staje sie strona meczu, a nie profil pilkarza,
- glowna akcja uzytkownika to szybkie wystawienie ocen po meczu,
- profil pilkarza pozostaje wazny, ale staje sie warstwa archiwum i agregacji.

## Najwazniejsze decyzje

### 1. Nie doklejac meczow do starego modelu na sile

Obecny backend jest player-centric:

- `Player` przechowuje srednia globalna,
- `Rating` jest ocena zawodnika bez kontekstu meczu,
- frontend i panel operuja glownie na CRUD zawodnikow i komentarzy.

Do rytmu meczowego potrzebujesz nowego modelu domenowego. Nie polecam upychac tego w obecne `ratings` bez dodatkowej warstwy, bo szybko zrobi sie nieczytelnie.

### 2. Mecz ma byc bytem pierwszej klasy

Kazdy mecz powinien miec:

- wlasny slug i publiczny URL,
- status operacyjny,
- liste zawodnikow dla danego meczu,
- oceny przypiete do meczu,
- gotowy link do sociali,
- wynik i podsumowanie po gwizdku.

### 3. Ocena meczowa jest zrodlem prawdy

Docelowo ocena wystawiona na stronie meczu powinna:

- byc zapisana jako `match rating`,
- byc widoczna na stronie meczu,
- zasiliac glowna srednia pilkarza,
- umozliwiac rankingi meczu, kolejki i sezonu.

To znaczy: agregat na profilu pilkarza powinien byc liczony z ocen meczowych. Obecne "ogolne" oceny bez meczu warto potraktowac jako tryb przejsciowy lub legacy.

## Rekomendowana architektura danych

### Istniejace modele do ponownego wykorzystania

- `Club`
- `Player`
- obecne media, komentarze i profile pilkarzy

### Nowe modele backendowe

Polecam nowa aplikacje Django, np. `matches`.

#### `Season`

- `id`
- `name`
- `is_active`

#### `Round`

- `id`
- `season_id`
- `number`
- `starts_at`
- `ends_at`
- `status` (`upcoming`, `live`, `completed`)

#### `Fixture`

- `id`
- `season_id`
- `round_id`
- `home_club_id`
- `away_club_id`
- `kickoff_at`
- `status` (`draft`, `lineup_pending`, `published`, `live`, `finished`, `archived`)
- `result_home`
- `result_away`
- `slug`
- `share_slug`
- `source_name`
- `source_url`
- `published_at`
- `lineup_confirmed_at`

#### `FixturePlayer`

- `id`
- `fixture_id`
- `player_id`
- `club_id`
- `side` (`home`, `away`)
- `selection_status` (`predicted`, `starting_xi`, `bench`, `played`, `unused`, `hidden`)
- `source_type` (`auto_full_squad`, `manual`, `paste_import`, `llm_match`)
- `source_confidence`
- `sort_order`
- `shirt_number`
- `minutes_played`
- `is_visible_public`

To jest kluczowy model. Pozwala miec inny stan zawodnika w kazdym meczu.

#### `FixtureRating`

- `id`
- `fixture_id`
- `fixture_player_id`
- `player_id`
- `user_id` albo `session_key`
- `value`
- `created_at`
- `updated_at`

Zasada biznesowa:

- jedna ocena na uzytkownika lub sesje dla zawodnika w jednym meczu,
- ocena moze byc edytowalna do okreslonego momentu, np. do 12 godzin po meczu.

#### `PlayerAlias`

- `id`
- `player_id`
- `club_id`
- `alias`
- `normalized_alias`
- `source`

To rozwiazuje problem prostego mapowania nazwisk importowanych z portali.

#### `FixturePublication`

- `id`
- `fixture_id`
- `channel` (`x`, `facebook`, `copy_link`)
- `publication_type` (`pre_match`, `full_time`, `post_match_summary`)
- `copy_text`
- `published_at`

To nie jest konieczne w pierwszym sprincie, ale daje porzadek pod sociale.

## Jak to spiac z obecnym systemem ocen

Rekomenduje podejscie etapowe:

### Etap przejsciowy

- zostaw obecny model `Rating` bez zmian,
- dodaj nowy model `FixtureRating`,
- licz `Player.average_rating` z obu zrodel przez okres przejsciowy,
- na frontendzie mocniej eksponuj tylko oceny meczowe.

### Etap docelowy

- nowe glosowanie odbywa sie juz tylko na stronach meczowych,
- ocena ogolna na profilu pilkarza staje sie agregatem z meczow,
- stary `Rating` zostaje zarchiwizowany albo wykorzystany tylko historycznie.

To jest bezpieczniejsze niz agresywna migracja na start.

## Backend: co zbudowac

### 1. API meczowe

Nowe endpointy REST:

- `GET /api/fixtures/upcoming`
- `GET /api/fixtures/{slug}`
- `GET /api/rounds/{season}/{round}`
- `POST /api/fixtures/{id}/ratings`
- `GET /api/fixtures/{id}/summary`
- `GET /api/fixtures/{id}/share`

Admin endpoints:

- `POST /api/admin/fixtures/generate-round`
- `POST /api/admin/fixtures/{id}/attach-full-squads`
- `POST /api/admin/fixtures/{id}/import-lineup`
- `PATCH /api/admin/fixture-players/{id}`
- `POST /api/admin/fixtures/{id}/publish`
- `POST /api/admin/fixtures/{id}/close`

### 2. Joby i komendy

Potrzebujesz prostego rytmu automatyzacji:

- codzienny job generujacy mecze na 7-10 dni do przodu,
- job przypinajacy domyslnie pelne kadry obu klubow,
- job zamykajacy mecz i odswiezajacy agregaty,
- job liczacy MVP meczu, najgorszy wynik i rankingi kolejki.

W Django najlepiej zaczac od management commands i crona/systemd, bez dokladania ciezkiego orchestration.

### 2a. Lepsze MVP niz cron: reczny import meczow z JSON

Na start nie musisz budowac crona pobierajacego terminarz. Lepszy i prostszy model MVP:

- w panelu zarzadzania masz ekran `Import meczow`,
- wklejasz JSON z jednym meczem, wieloma meczami albo cala kolejka,
- backend analizuje dane i robi preview,
- zatwierdzasz import,
- system tworzy `Fixture` i od razu zaklada strony meczowe.

To daje wieksza kontrole operacyjna i nie uzaleznia cie od zewnetrznych integracji.

### 2b. Workflow importu meczow

Docelowy proces powinien byc identyczny jak przy skladach:

1. w panelu wchodzisz w `Import meczow`,
2. wklejasz JSON kolejki lub kilku meczow,
3. backend waliduje format,
4. backend mapuje kluby do bazy,
5. backend sprawdza, czy mecz juz istnieje,
6. dostajesz preview z wynikami analizy,
7. zatwierdzasz import,
8. system tworzy lub aktualizuje mecze,
9. opcjonalnie system od razu przypina pelne kadry obu klubow.

To musi byc proces `analyze -> preview -> confirm`, nie slepy insert.

### 2c. Wzorcowy format JSON dla importu meczow

Przykladowy plik znajduje sie tutaj:

- [docs/features/match-fixtures-import-example.json](/Users/brakuzy/Code/personal/grill-ekstraklasa/docs/features/match-fixtures-import-example.json)

Minimalne pola wejsciowe:

- `matches[].round`
- `matches[].date`
- `matches[].time`
- `matches[].home_team`
- `matches[].away_team`
- `matches[].status`

Pola opcjonalne, ale warte dodania:

- `season`
- `source`
- `source_url`
- `timezone`

### 2d. Jak backend ma obrabiac import meczow

Dla kazdego wpisu z `matches[]` backend powinien:

1. zmapowac `home_team` i `away_team` na `Club`,
2. polaczyc `date` i `time` w `kickoff_at`,
3. ustawic `round`,
4. sprawdzic, czy taki `Fixture` juz istnieje,
5. oznaczyc rekord jako `new`, `duplicate`, `update`, `conflict` albo `unmatched_club`,
6. po zatwierdzeniu utworzyc albo zaktualizowac mecz.

Najprostsza regula wykrywania duplikatu na MVP:

- `home_club`
- `away_club`
- `kickoff_at`

To zapewni idempotencje. Import tego samego JSON-a drugi raz nie powinien tworzyc drugiego meczu.

### 2e. Statusy preview dla importu meczow

Panel powinien pokazywac dla kazdego meczu jeden z tych statusow:

- `new` - utworzymy nowy mecz,
- `duplicate` - taki mecz juz istnieje,
- `update` - mecz istnieje, ale wykryto zmiane, np. godziny,
- `conflict` - znaleziono podobny mecz, ale dane sie nie zgadzaja,
- `unmatched_club` - nie udalo sie rozpoznac jednego lub obu klubow.

To jest wazne, bo nie mozesz slepo tworzyc rekordow przy slabym mapowaniu klubow.

### 2f. Mapowanie klubow przy imporcie meczow

Mapowanie klubow powinno dzialac tak samo jak przy skladach:

1. exact match po nazwie,
2. normalizacja bez polskich znakow,
3. match po aliasie klubu,
4. reczna korekta w preview, jesli confidence jest za niski.

Przyklady, ktore system musi obsluzyc:

- `Legia` -> `Legia Warszawa`,
- `Rakow` -> `Rakow Czestochowa`,
- `Zaglebie` -> `Zaglebie Lubin`,
- `Termalica B-B.` -> alias odpowiadajacy klubowi w bazie.

### 2g. Co ma sie stac po zatwierdzeniu importu

Po `confirm` system powinien:

- utworzyc `Fixture`,
- wygenerowac slug i publiczny URL meczu,
- ustawic status np. `draft` lub `lineup_pending`,
- opcjonalnie przypiac pelne kadry obu klubow,
- zapisac surowy JSON importu w logu lub tabeli batch importu.

To ostatnie bardzo ulatwi diagnoze problemow i ponowne importy.

### 2h. Rekomendacja operacyjna

Na MVP polecam:

- mecze dodawac przez JSON w panelu,
- sklady dodawac przez JSON w panelu,
- oba importy oprzec o ten sam schemat `analyze -> preview -> confirm`.

Cron mozesz dolozyc pozniej, ale nie powinien byc blokujacym warunkiem wdrozenia modulu meczowego.

### 3. Agregacja ocen

Nie licz wszystkiego live w widokach. Dodaj jawny serwis agregacyjny:

- po zapisie `FixtureRating` aktualizuj srednia zawodnika,
- po zamknieciu meczu aktualizuj statystyki `Fixture`,
- po zamknieciu kolejki aktualizuj rankingi kolejki.

Mozesz to zrobic synchronicznie na MVP, a potem przeniesc do taskow async.

### 4. Anty-spam i tarcie

Z punktu widzenia wzrostu logowanie przed ocena meczu bedzie bolec. Rekomendacja:

- komentarze zostaw tylko dla zalogowanych,
- rating meczowy dopusc dla sesji anonimowej,
- wprowadz rate limiting po `session_key` + IP + user-agent,
- trzymaj jeden zapis na zawodnika per mecz per sesja.

Jesli chcesz bezpieczniejszy start techniczny, mozesz najpierw odpalic rating meczowy tylko dla zalogowanych, ale traktowalbym to jako krok przejsciowy, nie finalny.

## Frontend publiczny: jak to powinno dzialac

### Struktura URL

Polecam:

- `/mecze`
- `/mecze/{slug}`
- `/kolejki/{season}/{round}`

Slug meczu musi byc stabilny i czytelny, np.:

- `legia-warszawa-lech-poznan-2026-03-08`

### Stany strony meczu

Jedna strona powinna obsluzyc trzy stany:

- `pre-match`: widac zapowiedz i przewidywany sklad lub szeroka kadre,
- `live-ready`: widac oficjalny sklad i formularz ocen,
- `post-match`: widac wyniki ocen, MVP, "najbardziej grillowany", komentarze.

### UX oceniania

To ma byc ekstremalnie szybkie:

- kafle zawodnikow pogrupowane na gospodarzy i gosci,
- szybki tap 1-10,
- brak koniecznosci ocenienia wszystkich,
- natychmiastowe potwierdzenie zapisu,
- po oddaniu kilku ocen od razu sekcja "wyniki meczu".

### Social i linkowanie

Kazdy mecz powinien miec gotowe:

- jeden publiczny URL,
- przycisk `kopiuj link`,
- przygotowany opis do X,
- tagi Open Graph,
- obrazek socialowy przed meczem i po meczu.

To bardzo ulatwi dystrybucje.

### SEO

Nie budowalbym teraz osobnych wielkich landingow. Wystarczy:

- indeksowane strony meczowe,
- strona kolejki,
- podsumowanie kolejki,
- sekcja archiwum meczow.

## Panel zarzadzania: wykorzystac `grill-masters-repo`

Tak, ten panel warto wykorzystac. Powod:

- ma juz logowanie, auth i API client,
- ma gotowy wzorzec CRUD,
- jest oddzielony od publicznego frontu,
- da sie szybko rozszerzyc o nowe ekrany bez mieszania w Next.js.

### Nowe sekcje panelu

Polecam dodac:

- `Matches`
- `Match Editor`
- `Lineup Import`
- `Round Summary`

### Ekran `Matches`

Widok listy:

- data meczu,
- kolejka,
- gospodarze vs goscie,
- status,
- liczba przypietych zawodnikow,
- liczba ocen,
- akcje: `edytuj`, `importuj sklad`, `opublikuj`, `zamknij`.

### Ekran `Match Editor`

Kluczowy ekran operacyjny:

- dwa slupki: gospodarze i goscie,
- szybkie toggles: `11`, `lawka`, `gral`, `ukryj`,
- filtrowanie po pozycji,
- przycisk `ustaw cala kadre`,
- przycisk `pokaz publicznie`,
- sekcja metadanych meczu i link publiczny.

### Ekran `Lineup Import`

Najwazniejszy polautomat:

- wklejasz surowy tekst skladu z portalu,
- backend rozbija go na nazwiska,
- system probuje zmapowac nazwiska na `Player`,
- dostajesz preview z confidence,
- akceptujesz lub poprawiasz,
- zapis idzie do `FixturePlayer`.

To powinno oszczedzac najwiecej czasu operacyjnego.

### Ekran `Match Import`

To powinien byc osobny ekran lub modal w panelu:

- duze pole textarea na JSON,
- przycisk `Analizuj`,
- preview listy meczow,
- status kazdego wpisu: `new`, `duplicate`, `update`, `conflict`, `unmatched_club`,
- reczna korekta klubow przy slabym mapowaniu,
- przycisk `Zatwierdz import`.

To bedzie glowny sposob tworzenia stron meczowych na MVP.

## Plan uzupelniania skladow meczowych

To jest operacyjnie najwazniejszy element calego modulu meczowego. Strona meczu bez szybkiego uzupelniania skladu bedzie za droga czasowo w utrzymaniu.

### Docelowy workflow

Najprostszy i najlepszy model na start:

1. w panelu tworzysz mecz lub ustawiasz tylko oba kluby,
2. wchodzisz w zakladke `Import skladu`,
3. wklejasz JSON skladu wygenerowany z Flashscore lub przez ChatGPT,
4. backend analizuje JSON i mapuje kluby oraz zawodnikow do bazy,
5. dostajesz preview z trzema statusami:
   `matched`, `needs_review`, `not_found`,
6. poprawiasz tylko wyjatki,
7. klikasz `zatwierdz import`,
8. system zapisuje starterow i lawke do `FixturePlayer`,
9. reczne poprawki tworza aliasy na przyszlosc.

To musi byc proces `analyze -> preview -> confirm`, a nie slepy zapis od razu po wklejeniu.

### Dlaczego JSON jest dobrym formatem wejsciowym

Na MVP nie warto zaczynac od parsera surowego tekstu. JSON jest lepszy, bo:

- ma juz rozdzielenie na gospodarzy i gosci,
- ma osobno `starting_lineup` i `substitutes`,
- moze miec numery,
- moze miec wynik i status meczu,
- jest latwy do walidacji i wersjonowania.

To pozwala szybko wdrozyc panel bez budowy skomplikowanego parsera HTML czy scrape flow.

### Minimalny format JSON

Wzorcowy plik znajduje sie tutaj:

- [docs/features/match-lineup-import-example.json](/Users/brakuzy/Code/personal/grill-ekstraklasa/docs/features/match-lineup-import-example.json)

Panel powinien przyjmowac co najmniej:

- `match.home_team`
- `match.away_team`
- `teams.{team}.starting_lineup[]`
- `teams.{team}.substitutes[]`

Pola opcjonalne, ale bardzo przydatne:

- `score`
- `status`
- `formation`
- `number`
- `position`
- `captain`

### Jak ma dzialac mapowanie klubow

Najpierw backend musi rozpoznac kluby. Nie tylko po dokladnej nazwie.

Kolejnosc:

1. exact match po nazwie klubu,
2. match po znormalizowanej nazwie bez polskich znakow,
3. match po aliasie klubu, np. `Wisla Plock` -> `Wisla Plock` lub `Wisla`,
4. fallback do recznego wyboru klubu w panelu, jesli confidence jest niski.

Do tego warto dodac model pomocniczy `ClubAlias`:

- `club_id`
- `alias`
- `normalized_alias`
- `source`

### Jak ma dzialac mapowanie pilkarzy

To jest najwazniejsza czesc. System nie powinien szukac po calej bazie, tylko w obrebie skladu danego klubu.

Kolejnosc mapowania:

1. exact match po `PlayerAlias`,
2. exact match po pelnej nazwie zawodnika,
3. match po nazwie z usunieciem polskich znakow,
4. match po `nazwisko + inicjal imienia`,
5. match po numerze koszulki, jesli taki numer jest dostepny w danych klubowych,
6. fuzzy match tekstowy po ograniczonej liscie kandydatow,
7. fallback do Gemini tylko dla nierozpoznanych lub niejednoznacznych wpisow.

Przyklady, ktore ten mechanizm musi obsluzyc:

- `Dabrowski D.` -> `Dabrowski Damian` lub `Dabrowski` z polskimi znakami,
- `Buric J.` -> `Buric Jasmin` lub wariant z diakrytyka,
- `Haglind-Sangre M.` -> pelna nazwa z myslnikiem,
- `Wisla Plock` -> klub zapisany inaczej w bazie.

### Confidence i preview

Backend powinien zwracac dla kazdego wpisu:

- wpis z JSON,
- wykryty klub,
- typ: `starting_xi` albo `bench`,
- numer i pozycje, jesli sa,
- znalezionego zawodnika,
- confidence: `high`, `medium`, `low`,
- metode dopasowania, np. `alias`, `surname_initial`, `fuzzy`, `llm_candidate_pick`,
- status: `matched`, `needs_review`, `not_found`.

Zasada operacyjna:

- `high` moze byc wstepnie zaznaczone jako gotowe,
- `medium` powinno wymagac szybkiego potwierdzenia,
- `low` i `not_found` musza byc poprawione recznie.

### Co ma sie dziac, gdy pilkarza nie ma w bazie

To nie moze blokowac calego importu. Przy `not_found` panel powinien dawac trzy akcje:

- wybierz istniejacego pilkarza recznie,
- dodaj nowego pilkarza do bazy i przypisz od razu,
- zostaw puste i zapisz wpis do pozniejszego uzupelnienia.

Trzeci wariant jest wazny, bo czasem mecz trzeba opublikowac szybko, a brakujacego zawodnika dopniesz kilka minut pozniej.

### Aliasy i uczenie systemu

Kazda reczna poprawka nie powinna ginac. Po zatwierdzeniu importu system powinien:

- zapisac alias pilkarza do `PlayerAlias`,
- zapisac alias klubu do `ClubAlias`, jesli byl nowy,
- zapamietac zrodlo aliasu, np. `flashscore_json` albo `chatgpt_json`.

Dzieki temu kolejne importy beda coraz tansze operacyjnie.

### Rola Gemini

Gemini ma byc tylko warstwa pomocnicza. Nie moze byc glownym silnikiem mapowania.

Prawidlowy model:

1. backend robi exact, normalized i fuzzy match,
2. dla trudnych wpisow buduje liste 3-5 kandydatow z danego klubu,
3. Gemini dostaje wpis i tylko tych kandydatow,
4. Gemini zwraca JSON z wyborem albo `unmatched`,
5. czlowiek zatwierdza wynik.

Gemini nie powinno dostawac zadania "zgadnij pilkarza z calej ligi". To proszenie sie o halucynacje.

### Wymagania danych, ktore poprawia skutecznosc

Zeby ten import dzialal dobrze, warto dodac do modelu kadry klubowej:

- numer koszulki,
- status aktywny zawodnika,
- sezonowa przynaleznosc do klubu,
- aliasy pilkarzy i klubow.

Numer koszulki jest bardzo mocnym sygnalem pomocniczym przy rozstrzyganiu niejednoznacznych nazwisk.

### Co powinno zostac zaimplementowane jako pierwsze

Najbardziej pragmatyczna kolejnosc:

1. import JSON do meczu,
2. mapowanie klubow i pilkarzy bez LLM,
3. preview i reczna korekta,
4. zapis aliasow,
5. fallback do Gemini dla trudnych przypadkow.

To da realna oszczednosc czasu juz na wczesnym etapie, bez nadmiernej zlozonosci.

## Gemini / LLM: gdzie ma sens, a gdzie nie

Gemini ma sens jako warstwa dopasowania, nie jako glowna logika systemu.

### Rekomendowany pipeline mapowania skladu

#### Krok 1. Dopasowanie deterministyczne

Najpierw backend robi:

- exact match po nazwie,
- match po znormalizowanej nazwie bez polskich znakow,
- match po samym nazwisku w obrebie kadry klubu,
- match po tabeli `PlayerAlias`.

Wiekszosc przypadkow powinna zamknac sie tutaj.

#### Krok 2. Dopasowanie z kandydatami

Dla nierozpoznanych nazwisk backend przygotowuje kandydatow:

- tylko aktywni zawodnicy z danego klubu,
- kandydaci po podobienstwie tekstowym,
- max 3-5 kandydatow na wpis.

#### Krok 3. Gemini tylko dla trudnych przypadkow

Do Gemini wysylasz:

- surowe wpisy ze skladu,
- kandydatow z twojej bazy,
- prosbe o zwrot czystego JSON,
- confidence i uzasadnienie.

Gemini nie powinno miec pelnej swobody wyszukiwania. Ma tylko wybierac z przygotowanej listy lub zwracac `unmatched`.

#### Krok 4. Czlowiek zatwierdza

Regula operacyjna:

- confidence wysokie mozesz zaznaczyc jako preselected,
- confidence srednie lub niskie wymaga klikniecia,
- nic nie publikuje sie samo przy niskiej pewnosci.

#### Krok 5. Uczenie systemu

Kazda reczna poprawka:

- dopisuje alias,
- wzmacnia przyszle mapowanie,
- zmniejsza koszt LLM przy kolejnych meczach.

### Dlaczego to jest dobre podejscie

- redukuje koszt Gemini,
- ogranicza halucynacje,
- pozwala zachowac kontrole,
- zamienia reczna robote w system, ktory z czasem robi sie lepszy.

## Proponowany workflow operacyjny na mecz

### Dzien lub dwa przed meczem

- job tworzy `Fixture`,
- system przypina pelne kadry obu klubow,
- mecz dostaje URL i status `lineup_pending`.

### Dzien meczu rano

- w panelu sprawdzasz, czy mecz jest gotowy,
- opcjonalnie ustawiasz przewidywany sklad lub ukrywasz oczywiste braki.

### 60-30 minut przed meczem

- wklejasz oficjalny sklad z portalu lub wpisu klubowego,
- system robi mapping,
- poprawiasz tylko niepewne pozycje,
- klikasz `publikuj sklad`.

### Po ostatnim gwizdku

- strona meczu jest juz aktywna i ma ruch,
- users wystawiaja oceny,
- backend liczy MVP i najgorszy wynik live lub prawie live.

### 30-60 minut po meczu

- z panelu kopiujesz gotowy tekst do sociali,
- publikujesz wynik meczu w formacie Grill Ekstraklasa,
- link zawsze prowadzi do tej samej strony meczu.

## Roadmapa wdrozenia

### Faza 1. Fundament domenowy

Cel:

- nowe modele `Fixture`, `FixturePlayer`, `FixtureRating`, `PlayerAlias`,
- podstawowe API meczowe,
- slugi i statusy.

Efekt:

- system rozumie mecz jako osobny byt.

### Faza 2. Publiczne MVP strony meczu

Cel:

- strona meczu w Next.js,
- szybkie ratingi,
- sekcja wynikow meczu,
- podstawowe SEO i OG.

Efekt:

- mozna wrzucac link do konkretnego meczu.

### Faza 3. Panel operacyjny

Cel:

- lista meczow,
- edytor skladu,
- akcja `ustaw cala kadre`,
- publikacja skladu.

Efekt:

- obsluga jednego meczu zamyka sie w kilku minutach.

### Faza 4. Import skladu i Gemini assist

Cel:

- textarea do wklejania skladu,
- parser,
- matching deterministyczny,
- fallback do Gemini,
- preview z confidence.

Efekt:

- meczowe sklady uzupelniasz polautomatycznie.

### Faza 5. Rytm social + round summary

Cel:

- szablony copy do X,
- ranking kolejki,
- MVP kolejki,
- archiwum i strony round summary.

Efekt:

- masz zamkniety loop: mecz -> rating -> ranking -> social -> powrot.

## Co polecam zrobic najpierw

Jesli mialbym ustawic to pragmatycznie, zrobilbym to w tej kolejnosci:

1. backendowy model meczow i ocen meczowych,
2. publiczna strona meczu z ratingiem,
3. panel `Matches` + `Match Editor`,
4. import skladu z aliasami i dopiero potem Gemini,
5. automaty i podsumowania kolejki.

Najwazniejsza uwaga: nie zaczynaj od "idealnego importu oficjalnych skladow". Najpierw zbuduj system, w ktorym mecz istnieje, ma URL, ma zawodnikow i da sie go obsluzyc recznie w 3-5 minut.

## Ryzyka i zabezpieczenia

### Ryzyko 1. Za duza zlozonosc od startu

Zabezpieczenie:

- nie buduj pelnej statystyki meczowej,
- skup sie tylko na skladach, ratingach, rankingu i share.

### Ryzyko 2. Zly quality matching skladu

Zabezpieczenie:

- aliasy,
- preview,
- human-in-the-loop,
- Gemini tylko na trudne przypadki.

### Ryzyko 3. Za duze tarcie przy glosowaniu

Zabezpieczenie:

- rating bez logowania lub z minimalnym tarciem,
- brak koniecznosci ocenienia calej druzyny,
- mocny CTA po gwizdku.

### Ryzyko 4. Reczna obsluga zjada czas

Zabezpieczenie:

- domyslne przypiecie pelnej kadry,
- statusy operacyjne,
- szybkie toggles w panelu,
- kopiowanie linku i gotowe szablony publikacji.

## Finalna rekomendacja

Tak, kierunek meczowy jest zdecydowanie wlasciwy. Najbardziej sensowny uklad dla tego projektu to:

- backend Django rozszerzony o modul `matches`,
- publiczny frontend Next.js z nowymi stronami meczow,
- obecny panel `grill-masters-repo` rozszerzony o operacyjna obsluge meczow,
- Gemini uzyty jako wspomagacz mapowania skladu, a nie jako zrodlo prawdy.

Jesli to zrobisz dobrze, dostaniesz system, w ktorym:

- mecze tworza sie automatycznie,
- sklad da sie uzupelnic w kilka minut,
- kazdy mecz ma gotowy link do sociali,
- oceny z meczu zyja jednoczesnie na stronie meczu i w sredniej pilkarza,
- projekt zaczyna miec powtarzalny rytm operacyjny zamiast recznego chaosu.
