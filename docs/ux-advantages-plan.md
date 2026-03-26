# Atuty Grill Ekstraklasa — co masz i jak to pokazać

## Core przewaga (to trzeba krzyczeć od pierwszej sekundy)

Jeden atrybut: kibice rozliczają piłkarzy liczbą, nie słowem.
To jest unikalne. Flashscore da wynik. WP Sport da artykuł.
Nikt nie da: "Szkurin — 2.3/10 wg 47 kibiców po meczu z Widzewem".
To jest produkt i hook.

## Problem (dziś)

- Kibic po wejściu nie rozumie w 3 sekundy, że może kogoś „ugrillować”.
- „Aktualnie najniższe oceny” ładuje się dynamicznie, więc przez chwilę jest pusto.
- Top 5 najlepszych wygląda jak Wikipedia i nie budzi emocji.

## Jak to naprawić — konkretnie

1. Hero section (pierwszy ekran): walnij kartę z aktualnym dramatem.
2. Podtytuł strony: jedno zdanie emocji, nie opis funkcji.
3. Dramaty tygodnia: wyżej i z twarzami.
4. Strona meczu: wynik i średnie ocen obok siebie.
5. Manifest: „Tu liczy się ten mecz, nie cała kariera.” jako wyróżniony element.

### Przykładowy hero (karta dramatu)

```
🔥 DRAMAT KOLEJKI
Ilya Shkurin • Widzew Łódź
━━━━━━━━━━━━━━━━━━━
        2.3 / 10
   ★ oceniony przez 47 kibiców
━━━━━━━━━━━━━━━━━━━
[Zagłosuj sam →]    [Zobacz więcej dramatów]
```

### Podtytuł strony (propozycje)

- „Kibice wystawiają noty. Nikt się nie chowa.”
- „Grill po każdym meczu. Ty decydujesz kto dostaje 1/10.”

### Dramaty tygodnia (zasady)

- Karty, nie lista.
- Twarz zawodnika.
- Ocena DUŻA i czerwona, jeśli niska.
- Nazwa meczu i kolejka.
- Liczba głosów.

## Rzeczy do dodania bez dużego developmentu

- Licznik na żywo na homepage: „Dziś oceniono X zawodników”.
- „Twoja ocena vs kibice” po zagłosowaniu (różnica + procent surowości).
- Udostępnianie oceny jako obrazek (gotowy do X/Twittera).

## Priorytet wdrożenia

1. Hero z aktualnym dramatem (największy impact, mało kodu).
2. Dramaty tygodnia przed Top 5.
3. Blok „wynik + średnie ocen” na stronie meczu.
4. Licznik aktywności.
5. „Twoja ocena vs kibice” po głosowaniu.

## Notatka implementacyjna (dla agenta)

- Zacznij od layoutu i hooka (hero + dramaty).
- Dopiero potem dokładanie liczników i porównań.
- Każdy element musi być czytelny w 3 sekundy na mobile.
