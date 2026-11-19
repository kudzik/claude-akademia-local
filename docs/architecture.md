# Architektura

Claude Akademia to pojedynczy proces Node.js udostępniający interfejs z `public/` i JSON API z `server.mjs`. Serwer nasłuchuje na `127.0.0.1`, weryfikuje nagłówki Host i Origin oraz zapisuje stan w `data/academy.sqlite`.

## Dane

- `progress`: wspólny status i notatki lekcji.
- `messages`: historia rozmowy przypisana do lekcji i agenta.
- `agent_threads`: identyfikator zewnętrznej sesji dla pary lekcja–agent.
- `threads`: tabela starszego schematu, zachowana dla bezstratnej migracji istniejących sesji Codex.

Katalog `data/` i pliki SQLite wraz z WAL/SHM są ignorowane przez Git. Migracje muszą działać w miejscu i zachowywać dane użytkownika.

## Agent nauczycielski

Codex korzysta z `@openai/codex-sdk`, działa w katalogu repozytorium i w sandboxie tylko do odczytu. Claude Code i Antigravity są uruchamiane bez powłoki w osobnym katalogu tymczasowym, z limitem czasu i rozmiaru wyjścia. Claude działa w trybach safe/restricted bez narzędzi i MCP; Antigravity działa w swoim sandboxie bez rozwijania poleceń slash. Każdy adapter wznawia własną sesję. Prompt nauczyciela zabrania edycji oraz wykonywania poleceń.

## Granice bezpieczeństwa

Aplikacja jest przeznaczona dla jednego zaufanego użytkownika lokalnego. Ograniczenia Host/Origin zmniejszają ryzyko żądań z przeglądarki, ale nie stanowią uwierzytelniania wobec innych procesów lokalnych. Nie należy wystawiać serwera do LAN ani Internetu.
