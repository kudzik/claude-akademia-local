# Handoff — Claude Akademia

## Aktualny stan

- Gałąź główna: `main`
- Aktywne zadanie: brak
- Ostatni zamknięty Issue: #13
- Ostatni scalony PR: #14

## Co zostało wykonane

- PR #1 ze wzmocnieniami bezpieczeństwa, dokumentacją i systemem handoff został scalony metodą squash.
- Gałąź funkcji została połączona z aktualnym `main` bez przepisywania historii.
- Claude Code używa uwierzytelnienia użytkownika oraz trybów safe/restricted, bez narzędzi, MCP, poleceń slash i interaktywnych próśb o uprawnienia.
- Antigravity działa w sandboxie i bez rozwijania poleceń slash.
- Dodano test bezstratnej migracji starych wiadomości Codex do schematu wielu agentów.
- Właściciel wybrał licencję MIT; dodano standardowy plik `LICENSE`.
- Dodano trwały wybór ostatniej lekcji i agenta oraz kontrolowany fallback do historii SQLite dla brakującej sesji dostawcy.
- Moduł 00 otrzymał diagnozę, teorię, demonstrację, ćwiczenie z jawną checklistą i punktowany test końcowy.
- Wyniki dydaktyczne są zapisywane w SQLite bez ujawniania kluczy odpowiedzi w API stanu.
- Po próbie testu każde pytanie otrzymuje deterministyczne omówienie; komunikaty wyników używają `role=status` i `aria-live`.
- Dodano Playwright i izolowany test Chromium pełnego przepływu lekcji 00 na desktopie i urządzeniu mobilnym.
- Dodano kompletny moduł 01 oraz wspólny renderer i mechanizm ocen obsługujący wiele lekcji bez nowych endpointów.

## Co zostało zweryfikowane

- `npm run check` i `node --check agents.mjs`: zaliczone na Node.js 26.13.0 (2026-11-19).
- `npm test`: 11/11 testów zaliczonych, w tym migracja starej bazy, punktacja, trwałość wyników po restarcie i składnia skryptu UI.
- `npm run test:ui`: 3/3 testy Playwright zaliczone; sprawdzono oba moduły, feedback, niezależne wyniki, przeładowanie i brak poziomego przepełnienia przy 390 px.
- Zrzuty modułu 01 na desktopie i mobile zostały obejrzane; test wykrył przepełnienie CSS Grid, które naprawiono przez `minmax(0,1fr)`.
- Treść modułu 01 zweryfikowano 2026-11-19 z oficjalnymi stronami Anthropic: Overview, Quickstart, Configure permissions i Common workflows.
- Izolowany test live Claude z nieistniejącą sesją i historią w tymczasowej bazie: fallback zwrócił właściwy kontekst (`K7`).
- `npm audit --omit=dev`: 0 znanych podatności.
- Rzeczywiste pojedyncze odpowiedzi: Codex CLI/SDK 0.167.0, Claude Code 2.1.319 i Antigravity 1.5.9 — zaliczone.
- Rzeczywiste wznowienie sesji Claude Code i Antigravity w nowych katalogach tymczasowych — zaliczone.
- Brak śledzonych baz, plików sekretów i rozpoznanych tokenów w historii Git.

## Co pozostaje do wykonania

- Przeprowadzić krótką próbę modułu 01 z użytkownikiem i zebrać uwagi o długości, jasności oraz zapamiętaniu materiału.

## Znane problemy

- Testy API wymagają możliwości lokalnego nasłuchu na `127.0.0.1`; ograniczony sandbox może go blokować.
- Integracje CLI zostały sprawdzone na macOS; inne systemy wymagają osobnej weryfikacji.

## Decyzje i ograniczenia

- Nie użyto `claude --bare`, ponieważ wyłącza ono logowanie OAuth/keychain deklarowane w README.
- Zamknięty PR #2 nie mógł zmienić bazy po usunięciu gałęzi PR #1, dlatego zastępuje go PR #3 do `main`.
- Postępy lekcji są wspólne, a wiadomości i sesje rozdzielone według agenta.

## Następny zalecany krok

Po zakończeniu modułu 01 ocenić jego długość i retencję wiedzy przed rozpoczęciem modułu 02.
