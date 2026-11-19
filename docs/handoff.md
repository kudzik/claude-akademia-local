# Handoff — Claude Akademia

## Aktualny stan

- Gałąź główna: `main`
- Aktywne zadanie: zakończenie lokalnych adapterów wielu agentów
- Powiązany Issue: brak otwartych Issues
- Aktywny PR: #3 zastępuje automatycznie zamknięty PR #2

## Co zostało wykonane

- PR #1 ze wzmocnieniami bezpieczeństwa, dokumentacją i systemem handoff został scalony metodą squash.
- Gałąź funkcji została połączona z aktualnym `main` bez przepisywania historii.
- Claude Code używa uwierzytelnienia użytkownika oraz trybów safe/restricted, bez narzędzi, MCP, poleceń slash i interaktywnych próśb o uprawnienia.
- Antigravity działa w sandboxie i bez rozwijania poleceń slash.
- Dodano test bezstratnej migracji starych wiadomości Codex do schematu wielu agentów.

## Co zostało zweryfikowane

- `npm run check` i `node --check agents.mjs`: zaliczone na Node.js 26.13.0 (2026-11-19).
- `npm test`: 7/7 testów zaliczonych, w tym migracja starej bazy SQLite.
- `npm audit --omit=dev`: 0 znanych podatności.
- Rzeczywiste pojedyncze odpowiedzi: Codex CLI/SDK 0.167.0, Claude Code 2.1.319 i Antigravity 1.5.9 — zaliczone.
- Rzeczywiste wznowienie sesji Claude Code i Antigravity w nowych katalogach tymczasowych — zaliczone.
- Brak śledzonych baz, plików sekretów i rozpoznanych tokenów w historii Git.

## Co pozostaje do wykonania

- Przejrzeć i scalić PR #3 po końcowych kontrolach GitHub.
- Po scaleniu sprawdzić `main` i usunąć gałąź funkcji, jeśli nie jest już używana.
- W kolejnym zadaniu utworzyć zakres P1 dotyczący pełnego odtwarzania stanu nauki.

## Znane problemy

- Testy API wymagają możliwości lokalnego nasłuchu na `127.0.0.1`; ograniczony sandbox może go blokować.
- Repozytorium nie ma wybranej licencji open source.
- Integracje CLI zostały sprawdzone na macOS; inne systemy wymagają osobnej weryfikacji.

## Decyzje i ograniczenia

- Nie użyto `claude --bare`, ponieważ wyłącza ono logowanie OAuth/keychain deklarowane w README.
- Zamknięty PR #2 nie mógł zmienić bazy po usunięciu gałęzi PR #1, dlatego zastępuje go PR #3 do `main`.
- Postępy lekcji są wspólne, a wiadomości i sesje rozdzielone według agenta.

## Następny zalecany krok

Wykonać końcowy przegląd PR #3, scalić go metodą squash i potwierdzić testy na świeżym `main`.
