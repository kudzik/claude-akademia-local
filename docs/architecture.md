# Architektura

Claude Akademia to pojedynczy proces Node.js udostępniający interfejs z `public/` i JSON API z `server.mjs`. Serwer nasłuchuje na `127.0.0.1`, weryfikuje nagłówki Host i Origin oraz zapisuje stan w `data/academy.sqlite`.

## Dane

- `progress`: wspólny status i notatki lekcji.
- `messages`: historia rozmowy przypisana do lekcji; na `main` obsługuje jednego agenta.
- `threads`: identyfikator zewnętrznej sesji dla lekcji.

Katalog `data/` i pliki SQLite wraz z WAL/SHM są ignorowane przez Git. Migracje muszą działać w miejscu i zachowywać dane użytkownika.

## Agent nauczycielski

Stan bazowy korzysta z `@openai/codex-sdk`. Wątek jest wznawiany przez zapisany identyfikator, działa w katalogu repozytorium i w trybie tylko do odczytu. Prompt nauczyciela zabrania edycji oraz wykonywania poleceń. Integracje kolejnych CLI są rozwijane w osobnym PR i nie są częścią zatwierdzonego `main`.

## Granice bezpieczeństwa

Aplikacja jest przeznaczona dla jednego zaufanego użytkownika lokalnego. Ograniczenia Host/Origin zmniejszają ryzyko żądań z przeglądarki, ale nie stanowią uwierzytelniania wobec innych procesów lokalnych. Nie należy wystawiać serwera do LAN ani Internetu.
