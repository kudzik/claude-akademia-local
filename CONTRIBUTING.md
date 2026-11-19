# Contributing

Dziękujemy za zainteresowanie Claude Akademia. Projekt celowo pozostaje mały: **Node.js + wbudowany SQLite + lokalna aplikacja webowa + adapter agenta**.

## Jak zacząć

1. Przeczytaj [README.md](README.md), w szczególności ograniczenia bezpieczeństwa.
2. Otwórz Issue opisujące problem lub planowaną zmianę (chyba że chodzi o podatność — wtedy [SECURITY.md](SECURITY.md)).
3. Utwórz gałąź ze swojej kopii repozytorium; nie pracuj bezpośrednio na `main`.
4. Uruchom `npm ci`, `npm run check` i ręcznie sprawdź scenariusz zmienianej funkcji.
5. Otwórz PR z krótkim opisem zmian, sposobu testowania i potencjalnych ryzyk.

## Zasady projektu

- Nie dodawaj chmury, osobnej bazy danych ani frameworków bez wyraźnej potrzeby.
- Nie zapisuj tokenów, baz SQLite, historii rozmów ani prywatnych ścieżek w repozytorium, testach i zrzutach ekranu.
- Zachowaj kompatybilność z macOS, Windows i Linux.
- Dokumentuj **tylko istniejące** funkcje jako gotowe; adaptery Claude Code i Antigravity są nadal planowane.
- Do zmian w API dołącz weryfikację bezpieczeństwa żądań i scenariusze błędów.
- Nie zamykaj PR ani nie łącz zmian bez przeglądu właściciela.

## Licencjonowanie

Repozytorium nie ma jeszcze pliku `LICENSE`. Do czasu wyboru licencji przez właściciela nie zakładaj, że kod można redystrybuować jako open source. Dyskusja i zgłoszenia problemów są mile widziane.
