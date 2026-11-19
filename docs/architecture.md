# Architektura

Claude Akademia to pojedynczy proces Node.js udostępniający interfejs z `public/` i JSON API z `server.mjs`. Serwer nasłuchuje na `127.0.0.1`, weryfikuje nagłówki Host i Origin oraz zapisuje stan w `data/academy.sqlite`.

## Dane

- `progress`: wspólny status i notatki lekcji.
- `messages`: historia rozmowy przypisana do lekcji i agenta.
- `agent_threads`: identyfikator zewnętrznej sesji dla pary lekcja–agent.
- `threads`: tabela starszego schematu, zachowana dla bezstratnej migracji istniejących sesji Codex.
- `app_state`: ostatnio wybrana lekcja i agent, używane do wznowienia miejsca nauki po restarcie.
- `lesson_results`: odpowiedzi i wyniki diagnozy oraz testu końcowego, a także potwierdzenie wykonania ćwiczenia.

Katalog `data/` i pliki SQLite wraz z WAL/SHM są ignorowane przez Git. Migracje muszą działać w miejscu i zachowywać dane użytkownika.

Klucze odpowiedzi testów pozostają w `server.mjs`; API stanu udostępnia tylko punktację i stan wykonania. Po przesłaniu odpowiedzi endpoint oceny zwraca dla każdego pytania wynik i deterministyczne wyjaśnienie, ale nie udostępnia klucza przed próbą. Lekcja nie jest automatycznie oznaczana jako ukończona na podstawie odpowiedzi modelu ani samego wyniku — użytkownik potwierdza status po wykonaniu jawnych kryteriów.

## Agent nauczycielski

Codex korzysta z `@openai/codex-sdk`, działa w katalogu repozytorium i w sandboxie tylko do odczytu. Claude Code i Antigravity są uruchamiane bez powłoki w osobnym katalogu tymczasowym, z limitem czasu i rozmiaru wyjścia. Claude działa w trybach safe/restricted bez narzędzi i MCP; Antigravity działa w swoim sandboxie bez rozwijania poleceń slash. Każdy adapter wznawia własną sesję. Jeśli Codex albo Claude zgłosi, że sesja już nie istnieje, aplikacja usuwa wyłącznie nieaktualny identyfikator i jednokrotnie rozpoczyna nową sesję z maksymalnie 12 ostatnimi wiadomościami z SQLite. Inne błędy, np. sieciowe lub limitu, nie uruchamiają fallbacku. Prompt nauczyciela zabrania edycji oraz wykonywania poleceń.

## Granice bezpieczeństwa

Aplikacja jest przeznaczona dla jednego zaufanego użytkownika lokalnego. Ograniczenia Host/Origin zmniejszają ryzyko żądań z przeglądarki, ale nie stanowią uwierzytelniania wobec innych procesów lokalnych. Nie należy wystawiać serwera do LAN ani Internetu.
