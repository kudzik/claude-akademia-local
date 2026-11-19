# Handoff — Claude Akademia

## Aktualny stan

- Gałąź główna: `main`
- Aktywne zadanie: brak; P1 zakończone
- Powiązany Issue: #5 — zamknięty
- Aktywny PR: brak; PR #6 scalony

## Co zostało wykonane

- PR #1 ze wzmocnieniami bezpieczeństwa, dokumentacją i systemem handoff został scalony metodą squash.
- Gałąź funkcji została połączona z aktualnym `main` bez przepisywania historii.
- Claude Code używa uwierzytelnienia użytkownika oraz trybów safe/restricted, bez narzędzi, MCP, poleceń slash i interaktywnych próśb o uprawnienia.
- Antigravity działa w sandboxie i bez rozwijania poleceń slash.
- Dodano test bezstratnej migracji starych wiadomości Codex do schematu wielu agentów.
- Właściciel wybrał licencję MIT; dodano standardowy plik `LICENSE`.
- Dodano trwały wybór ostatniej lekcji i agenta oraz kontrolowany fallback do historii SQLite dla brakującej sesji dostawcy.

## Co zostało zweryfikowane

- `npm run check` i `node --check agents.mjs`: zaliczone na Node.js 26.13.0 (2026-11-19).
- `npm test`: 9/9 testów zaliczonych, w tym migracja starej bazy, restart serwera i klasyfikacja błędów sesji.
- Izolowany test live Claude z nieistniejącą sesją i historią w tymczasowej bazie: fallback zwrócił właściwy kontekst (`K7`).
- `npm audit --omit=dev`: 0 znanych podatności.
- Rzeczywiste pojedyncze odpowiedzi: Codex CLI/SDK 0.167.0, Claude Code 2.1.319 i Antigravity 1.5.9 — zaliczone.
- Rzeczywiste wznowienie sesji Claude Code i Antigravity w nowych katalogach tymczasowych — zaliczone.
- Brak śledzonych baz, plików sekretów i rozpoznanych tokenów w historii Git.

## Co pozostaje do wykonania

- Utworzyć zakres P2 dla pierwszej kompletnej lekcji wzorcowej.

## Znane problemy

- Testy API wymagają możliwości lokalnego nasłuchu na `127.0.0.1`; ograniczony sandbox może go blokować.
- Integracje CLI zostały sprawdzone na macOS; inne systemy wymagają osobnej weryfikacji.

## Decyzje i ograniczenia

- Nie użyto `claude --bare`, ponieważ wyłącza ono logowanie OAuth/keychain deklarowane w README.
- Zamknięty PR #2 nie mógł zmienić bazy po usunięciu gałęzi PR #1, dlatego zastępuje go PR #3 do `main`.
- Postępy lekcji są wspólne, a wiadomości i sesje rozdzielone według agenta.

## Następny zalecany krok

Po zakończeniu P1 rozpocząć P2 jako osobne Issue: pierwszą kompletną lekcję wzorcową.
