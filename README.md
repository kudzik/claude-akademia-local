# Claude Akademia — lokalny MVP

Jedna aplikacja lokalna: **Node.js 24+, SQLite (`node:sqlite`) i oficjalny Codex SDK**. Bez hostingu, bez D1, bez frameworka webowego.

## Start

1. Otwórz ten folder w VS Code (na Windows, macOS lub WSL, w tym samym środowisku, w którym masz dostęp do Codex).
2. Upewnij się, że w Codex CLI jesteś zalogowany (`codex login`), a Node.js ma wersję co najmniej 24.
3. W terminalu uruchom:

```bash
npm install
npm start
```

4. Otwórz `http://127.0.0.1:4317`.

## Funkcje

- Lista 12 modułów z ustalonego programu.
- Zapis statusu lekcji i notatek w `data/academy.sqlite`.
- Lokalna historia rozmów osobno dla każdego modułu.
- Wznawianie wątku agenta Codex na podstawie identyfikatora sesji.
- Sandbox agenta tylko do odczytu; brak wykonywania automatycznych zmian w projekcie.
- Lokalny serwer nasłuchuje tylko na `127.0.0.1`.

## Ograniczenia wersji MVP

- Lekcje są obecnie szkieletem; nie ma jeszcze gotowych wieloetapowych materiałów ani automatycznych quizów.
- Postępy oznaczasz ręcznie; nie są jeszcze oceniane przez nauczyciela.
- UI czeka na pełną odpowiedź; na razie brak strumieniowania tokenów.
- Wznowienie sesji Codex zależy od zgodności SDK, lokalnej sesji i działającego logowania.
- Historia przechowywana w SQLite nie jest automatycznie dołączana przy utracie wątku Codex; można ją odczytać w UI.
- Lokalna baza nie jest szyfrowana; należy chronić katalog użytkownika i nie udostępniać portu sieciowego.
- Aplikacja korzysta z serwera Codex przez SDK; NIE steruje interfejsem wtyczki VS Code.

## Kopie zapasowe

Zatrzymaj aplikację i skopiuj cały katalog `data/` do bezpiecznego miejsca. Gdy SQLite działa w trybie WAL, kopiowanie samego pliku `.sqlite` podczas pracy serwera może nie objąć niezapisanych jeszcze transakcji.
