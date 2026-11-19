# Handoff — Claude Akademia

## Aktualny stan

- Gałąź główna: `main`
- Aktywne zadanie: audyt i zakończenie utwardzenia bezpieczeństwa
- Powiązany Issue: brak otwartych Issues
- Aktywny PR: #1; zależny PR #2 pozostaje w wersji roboczej

## Co zostało wykonane

- Zweryfikowano lokalne gałęzie, zakres PR #1 i #2 oraz aktualny stan GitHub.
- Dodano minimalne instrukcje, opis architektury, roadmapę i ten handoff.
- Poprawiono test nagłówka Host dla Node.js 26, używając niskopoziomowego klienta HTTP.

## Co zostało zweryfikowane

- `npm run check`: zaliczony na Node.js 26.13.0.
- `npm audit --omit=dev`: 0 znanych podatności (2026-11-19).
- `npm test`: 5/5 testów zaliczonych na gałęzi PR #1 (Node.js 26.13.0, 2026-11-19).
- GitHub: PR #1 i #2 są otwarte jako draft, bez kontroli CI; brak Issues (2026-11-19).

## Co pozostaje do wykonania

- Zaktualizować PR #1 i scalić dopiero po przeglądzie.
- Zweryfikować migrację SQLite, argumenty, sesje i rzeczywiste odpowiedzi Claude Code oraz Antigravity w PR #2.

## Znane problemy

- Testy API wymagają możliwości lokalnego nasłuchu na `127.0.0.1`; ograniczony sandbox może go blokować.
- Repozytorium nie ma jeszcze wybranej licencji open source.

## Decyzje i ograniczenia

- Dokumenty ciągłości są częścią PR #1, ponieważ opisują stan bazowy całego projektu.
- PR #2 pozostaje zależny od PR #1 do czasu scalenia zabezpieczeń.

## Następny zalecany krok

Uruchomić pełne kontrole PR #1, następnie zaktualizować go na GitHub i scalić przed dalszą pracą nad PR #2.
