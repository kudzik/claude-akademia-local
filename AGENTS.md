# Claude Akademia — instrukcje dla agentów

## Cel i architektura

Rozwijaj prostą, lokalną aplikację edukacyjną do nauki Claude Code. Używaj Node.js, lokalnego interfejsu webowego, SQLite i oficjalnych SDK/CLI agentów. Serwer ma nasłuchiwać wyłącznie na `127.0.0.1`. Nie dodawaj hostingu, kont, zewnętrznej bazy, Dockera ani rozbudowanych abstrakcji bez uzasadnionej potrzeby.

## Początek pracy

1. Przeczytaj `docs/handoff.md`, `docs/roadmap.md` i w razie potrzeby `docs/architecture.md`.
2. Sprawdź `git status`, bieżącą gałąź, aktualny stan GitHub, powiązany Issue i PR.
3. Porównaj dokumentację z kodem i testami. Fakty z kodu, testów i GitHub mają pierwszeństwo.

## Zasady zmian

- Jedno zadanie = jedna gałąź = jeden PR. Nie pracuj bezpośrednio na `main`.
- Zachowuj lokalne dane i cudze zmiany. Nie używaj destrukcyjnego resetu.
- Nie publikuj baz SQLite, sekretów, konfiguracji uwierzytelniania, identyfikatorów sesji ani prywatnych logów.
- Utrzymuj ograniczenia Host/Origin, limity wejścia i wyjścia oraz minimalne uprawnienia agentów.
- Preferuj małe moduły, jawny kod i wbudowane API Node.js. Dostosuj styl do istniejącego kodu.
- Zmiana migracji musi zachowywać istniejące dane i mieć test aktualizacji starego schematu.

## Kontrole i PR

Przed wysłaniem zmian uruchom `npm run check`, `npm test` i odpowiednie testy ręczne. Testy integracji z dostawcami uruchamiaj tylko, gdy środowisko jest uwierzytelnione; zapisz rzeczywisty wynik. PR ma opisywać zakres, ryzyko, wyniki testów i nierozwiązane ograniczenia. Nie scalaj przy niezaliczonych kontrolach.

## Zakończenie pracy

Zaktualizuj `docs/handoff.md` faktami: wykonane zmiany, uruchomione testy, znane problemy i jeden następny krok. Aktualizuj roadmapę tylko przy zmianie planu, a architekturę tylko przy zmianie stanu technicznego.
