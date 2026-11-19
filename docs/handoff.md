# Handoff — Claude Akademia

## Aktualny stan

- Gałąź główna: `main`
- Aktywne zadanie: brak; informacja zwrotna P2 ukończona
- Powiązany Issue: #9 — zamknięty
- Aktywny PR: brak; PR #10 scalony

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

## Co zostało zweryfikowane

- `npm run check` i `node --check agents.mjs`: zaliczone na Node.js 26.13.0 (2026-11-19).
- `npm test`: 11/11 testów zaliczonych, w tym migracja starej bazy, punktacja, trwałość wyników po restarcie i składnia skryptu UI.
- Izolowany test live Claude z nieistniejącą sesją i historią w tymczasowej bazie: fallback zwrócił właściwy kontekst (`K7`).
- `npm audit --omit=dev`: 0 znanych podatności.
- Rzeczywiste pojedyncze odpowiedzi: Codex CLI/SDK 0.167.0, Claude Code 2.1.319 i Antigravity 1.5.9 — zaliczone.
- Rzeczywiste wznowienie sesji Claude Code i Antigravity w nowych katalogach tymczasowych — zaliczone.
- Brak śledzonych baz, plików sekretów i rozpoznanych tokenów w historii Git.

## Co pozostaje do wykonania

- Wykonać wizualny przegląd lekcji 00 w dostępnej przeglądarce przed użyciem jej jako wzorca modułu 01.

## Znane problemy

- Testy API wymagają możliwości lokalnego nasłuchu na `127.0.0.1`; ograniczony sandbox może go blokować.
- Integracje CLI zostały sprawdzone na macOS; inne systemy wymagają osobnej weryfikacji.
- Podgląd wizualny P2 nie był dostępny w bieżącym środowisku narzędzi; DOM, składnia klienta i przepływy API zostały zweryfikowane automatycznie.

## Decyzje i ograniczenia

- Nie użyto `claude --bare`, ponieważ wyłącza ono logowanie OAuth/keychain deklarowane w README.
- Zamknięty PR #2 nie mógł zmienić bazy po usunięciu gałęzi PR #1, dlatego zastępuje go PR #3 do `main`.
- Postępy lekcji są wspólne, a wiadomości i sesje rozdzielone według agenta.

## Następny zalecany krok

Wykonać wizualny przegląd i krótką sesję użytkownika lekcji 00, a następnie zdecydować o rozpoczęciu modułu 01.
