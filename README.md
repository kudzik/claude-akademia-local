# Claude Akademia — lokalny kurs Claude Code

Prosta, lokalna aplikacja edukacyjna z interfejsem webowym, historią rozmów i postępami nauki. Projekt jest w fazie **MVP (0.1)**. Dane użytkownika są przechowywane w lokalnym pliku SQLite, bez hostingu i zewnętrznej bazy.

> **Stan funkcji:** dostępne są trzy adaptery: **OpenAI Codex**, **Claude Code CLI** i **Google Antigravity CLI**. Adaptery CLI wymagają osobnej instalacji i uwierzytelnienia. Ich rzeczywiste połączenie trzeba sprawdzić na swoim komputerze. Projekt nie jest oficjalnym produktem żadnego z dostawców.

## Wymagania

- Node.js **24 lub nowszy** i npm.
- Git (zalecany; Codex może wymagać pracy w zaufanym repozytorium Git).
- Do pracy z Codex: Codex CLI z aktywnym logowaniem i dostępem do modelu.
- Do pracy z Claude Code: polecenie `claude` dostępne w PATH i ukończone `claude auth login`.
- Do pracy z Antigravity: polecenie `agy` dostępne w PATH i wcześniejsze logowanie interaktywne do Antigravity CLI.
- Każdy dostawca ma własne limity i zasady naliczania opłat. Aplikacja nie przełącza się samoczynnie na inny płatny model.
- macOS, Windows albo Linux, w tym WSL (instaluj zależności i uruchamiaj serwer w tym samym środowisku, w którym działa Codex).

## Szybki start

```bash
git clone https://github.com/kudzik/claude-akademia-local.git
cd claude-akademia-local
npm ci
npm start
```

Otwórz **http://127.0.0.1:4317**. Aplikacja nasłuchuje tylko na `127.0.0.1`. Używaj tego adresu (zamiast `localhost`) ze względu na weryfikację nagłówka Host.

Jeśli Codex nie jest zalogowany, uruchom `codex login` w tym samym środowisku co serwer, a następnie sprawdź dostęp do usługi. Samo logowanie w rozszerzeniu VS Code nie gwarantuje poprawnego działania CLI/SDK. Aplikacja korzysta z **@openai/codex-sdk**, nie steruje oknem rozszerzenia VS Code.

## Co już działa

- Program 12 modułów Claude Code (na razie konspekt, bez pełnych treści lekcji).
- Ręczny zapis statusu i notatek do `data/academy.sqlite`.
- Przełącznik Codex / Claude Code / Antigravity w rozmowie nauczycielskiej.
- Oddzielna historia rozmów i identyfikatory sesji dla każdego agenta oraz modułu.
- Automatyczna migracja istniejących rozmów Codex bez usuwania zapisanych danych.
- Codex SDK: sandbox tylko do odczytu; Claude CLI: tryb bez narzędzi i MCP; Antigravity CLI: sandbox, katalog tymczasowy i brak automatycznego zatwierdzania uprawnień.
- Ograniczenia czasu odpowiedzi i wielkości wyjścia CLI.

## Czego jeszcze nie ma

- Pełnej weryfikacji działających instalacji Claude Code i Antigravity na każdym systemie operacyjnym.
- Kompletnych lekcji, automatycznych testów i ocen kompetencji.
- Automatycznego przywracania pełnego kontekstu nauczyciela z historii SQLite po utracie sesji Codex.
- Strumieniowego wyświetlania odpowiedzi, kont użytkowników, dostępu z innych urządzeń.
- Wbudowanego zarządzania kosztami API lub limitami dostawców.

## Przechowywanie danych i prywatność

- Baza SQLite z notatkami i rozmowami powstaje w `data/academy.sqlite` i **nie powinna trafić do repozytorium**. `.gitignore` wyklucza katalog `data/`, lokalne bazy, pliki WAL/SHM i konfiguracje z sekretami.
- Dane w SQLite **nie są szyfrowane**. Chroń konto systemowe i kopie zapasowe.
- Wiadomości wysyłane do agenta trafiają do usługi jego dostawcy; aplikacja nie działa w pełni offline. Każdy agent ma osobną historię, natomiast postępy lekcji są wspólne.
- Serwer nie ma logowania użytkowników. **Nie wystawiaj portu do Internetu ani na LAN** i nie uruchamiaj go za publicznym reverse proxy.
- Kod ogranicza nagłówki Host oraz Origin dla żądań API. To ochrona przed typowymi żądaniami z przeglądarki, **nie** autoryzacja dla nieufnych procesów lokalnych.
- Nie umieszczaj tokenów, haseł i innych sekretów w wiadomościach do nauczyciela ani w notatkach.

### Kopia zapasowa

Zatrzymaj aplikację i skopiuj **cały katalog `data/`** w bezpieczne miejsce. Przy aktywnym SQLite w trybie WAL skopiowanie tylko jednego pliku bazy może pominąć ostatnie transakcje.

## Rozwiązywanie problemów

| Problem | Co sprawdzić |
|---|---|
| `Not inside a trusted directory` | Uruchom aplikację z katalogu repozytorium Git; po pobraniu przez `git clone` katalog ma już `.git`. |
| Codex nie odpowiada | Logowanie w Codex CLI, uprawnienia, dostęp do modelu, limit użycia i połączenie internetowe. |
| Claude Code nie odpowiada | Uruchom `claude auth status` oraz `claude --safe-mode --restricted -p \"Cześć\" --output-format json --tools \"\"`; sprawdź wersję CLI i limity. |
| Antigravity nie odpowiada | Uruchom interaktywnie `agy`, następnie `agy --disable-slash-commands -p \"Cześć\" --output-format json --sandbox`; sprawdź dostęp i limity. |
| `403 Niedozwolony adres hosta` | Użyj `http://127.0.0.1:4317`, bez proxy i innego hosta. |
| `403 Niedozwolone źródło żądania` | Wysyłaj żądania z tej samej lokalnej witryny, nie z innej strony. |
| `EADDRINUSE` | Port 4317 jest zajęty; zatrzymaj drugą instancję. |
| Nie zapisują się postępy | Sprawdź możliwość zapisu do katalogu `data/` i miejsce na dysku. |

Kontrola składni serwera: `npm run check`. Testy lokalnego API i bazy: `npm test`. Testy te nie wywołują zewnętrznych modeli. Osobno sprawdź ręcznie po jednej wiadomości u każdego dostępnego agenta.

## Udział społeczności

Przeczytaj [CONTRIBUTING.md](CONTRIBUTING.md). Problemy bezpieczeństwa zgłaszaj zgodnie z [SECURITY.md](SECURITY.md), nie publikuj sekretów w Issues.

## Licencja

**Nie wybrano jeszcze licencji open source.** Publiczne repozytorium nie oznacza automatycznego prawa do kopiowania, modyfikowania i redystrybucji kodu. Właściciel repozytorium powinien zatwierdzić np. MIT i dodać plik `LICENSE` przed promowaniem projektu jako open source.
