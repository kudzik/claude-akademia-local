# Security policy

## Supported versions

Projekt jest eksperymentalnym MVP. Poprawki bezpieczeństwa są priorytetem w bieżącej gałęzi `main`; nie ma jeszcze formalnie utrzymywanych wydań.

## Reporting a vulnerability

**Nie publikuj podatności wraz z działającym exploitem, tokenami ani prywatnymi danymi w publicznych Issues.** Jeśli w repozytorium jest dostępna funkcja GitHub **Private vulnerability reporting**, użyj jej w zakładce Security. W przeciwnym razie skontaktuj się prywatnie z właścicielem repozytorium przez dostępny kanał GitHub, bez załączania sekretów. Nie podajemy tu niezweryfikowanego adresu e-mail.

Podaj wersję/commit, sposób odtworzenia, oczekiwane i rzeczywiste zachowanie oraz wpływ na bezpieczeństwo; usuń dane wrażliwe z przykładów.

## Model zagrożeń

Aplikacja jest przeznaczona dla **jednego użytkownika na zaufanym komputerze**.
- Nasłuchuje na `127.0.0.1` i sprawdza Host; żądania modyfikujące API z przeglądarki sprawdzają Origin i `Content-Type`.
- Nie posiada systemu kont ani uwierzytelniania API. Lokalny proces mający dostęp do komputera może próbować wywoływać API.
- Baza `data/academy.sqlite` nie jest szyfrowana. Zawiera historię rozmów i notatki.
- Wiadomości do Codex są przesyłane do dostawcy AI i podlegają jego zasadom.
- Nie wystawiaj portu przez tunel, proxy lub publiczny interfejs sieciowy. Nie zapisuj kluczy w repozytorium.
- `.gitignore` nie usuwa plików już śledzonych przez Git ani nie usuwa sekretów z historii. Ujawnione klucze trzeba unieważnić/obrócić, a historię zbadać osobno.

Przed zgłoszeniem błędu usuń z logów ścieżki prywatne, identyfikatory sesji i treści rozmów.
