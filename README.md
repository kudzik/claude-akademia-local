# Claude Akademia — lokalny kurs Claude Code

Prosta, lokalna aplikacja edukacyjna z interfejsem webowym, historią rozmów i postępami nauki. Projekt jest w fazie **MVP (0.1)**. Dane użytkownika są przechowywane w lokalnym pliku SQLite, bez hostingu i zewnętrznej bazy.

> **Stan funkcji:** na dziś działa adapter **OpenAI Codex**. Claude Code i Google Antigravity są planowane — nie są jeszcze zintegrowane. Nazwa aplikacji nie oznacza, że jest to oficjalny produkt Anthropic, OpenAI ani Google.

## Wymagania

- Node.js **24 lub nowszy** i npm.
- Git (zalecany; Codex może wymagać pracy w zaufanym repozytorium Git).
- Codex CLI z aktywnym logowaniem i dostępem do modelu; obowiązują limity Twojego planu.
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
- Oddzielna historia rozmów Codex w każdym module.
- Wznawianie sesji na podstawie zapisanego identyfikatora Codex, jeśli sesja jest dostępna.
- Lokalny sandbox Codex w trybie tylko do odczytu.

## Czego jeszcze nie ma

- Integracji z Claude Code i Antigravity; wyboru dostawcy AI.
- Kompletnych lekcji, automatycznych testów i ocen kompetencji.
- Automatycznego przywracania pełnego kontekstu nauczyciela z historii SQLite po utracie sesji Codex.
- Strumieniowego wyświetlania odpowiedzi, kont użytkowników, dostępu z innych urządzeń.
- Wbudowanego zarządzania kosztami API lub limitami dostawców.

## Przechowywanie danych i prywatność

- Baza SQLite z notatkami i rozmowami powstaje w `data/academy.sqlite` i **nie powinna trafić do repozytorium**. `.gitignore` wyklucza katalog `data/`, lokalne bazy, pliki WAL/SHM i konfiguracje z sekretami.
- Dane w SQLite **nie są szyfrowane**. Chroń konto systemowe i kopie zapasowe.
- Wiadomości wysyłane do agenta trafiają do usługi jego dostawcy; aplikacja nie działa w pełni offline.
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
| `403 Niedozwolony adres hosta` | Użyj `http://127.0.0.1:4317`, bez proxy i innego hosta. |
| `403 Niedozwolone źródło żądania` | Wysyłaj żądania z tej samej lokalnej witryny, nie z innej strony. |
| `EADDRINUSE` | Port 4317 jest zajęty; zatrzymaj drugą instancję. |
| Nie zapisują się postępy | Sprawdź możliwość zapisu do katalogu `data/` i miejsce na dysku. |

Kontrola składni serwera: `npm run check`.

## Udział społeczności

Przeczytaj [CONTRIBUTING.md](CONTRIBUTING.md). Problemy bezpieczeństwa zgłaszaj zgodnie z [SECURITY.md](SECURITY.md), nie publikuj sekretów w Issues.

## Licencja

**Nie wybrano jeszcze licencji open source.** Publiczne repozytorium nie oznacza automatycznego prawa do kopiowania, modyfikowania i redystrybucji kodu. Właściciel repozytorium powinien zatwierdzić np. MIT i dodać plik `LICENSE` przed promowaniem projektu jako open source.
