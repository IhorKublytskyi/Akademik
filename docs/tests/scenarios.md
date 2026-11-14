# Scenariusze testów manualnych — Akademik

**Środowisko:** http://localhost, Chrome 147.0.7727.102 (64-bit), Windows 11 Pro  
**Aplikacja:** `docker compose up -d`

| Rola | Login | Hasło |
|------|-------|-------|
| Administrator | admin@akademik.com | admin123 |
| Mieszkaniec | i.kublytskyi@student.com | student123 |

Dokument ma dwie części: **WEB-TC** — testy interfejsu użytkownika, **INT-TC** — testy integracji usług (import CSV, kolejki, ponawianie, klucz wewnętrzny, unieważnianie kodów QR). Opis architektury integracji: [`docs/integration.md`](../integration.md).

---

## Część 1. Testy interfejsu (WEB-TC)

### WEB-TC-001 — Logowanie z poprawnymi danymi

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz logowania |
| **Typ testu** | Pozytywny |
| **Dane testowe** | admin@akademik.com / admin123 |
| **Warunki wstępne** | Konto istnieje; użytkownik niezalogowany |
| **Kroki** | 1. Otwórz /login · 2. Wpisz email · 3. Wpisz hasło · 4. Kliknij „Zaloguj się" |
| **Oczekiwany rezultat** | Przekierowanie na /dashboard; nazwa użytkownika widoczna w nagłówku |
| **Rzeczywisty rezultat** | Przekierowanie na /dashboard nastąpiło. W nagłówku widoczna nazwa „Administrator". |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-002 — Logowanie z błędnym hasłem

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz logowania |
| **Typ testu** | Negatywny |
| **Dane testowe** | admin@akademik.com / zlehaslo999 |
| **Warunki wstępne** | Konto istnieje; użytkownik niezalogowany |
| **Kroki** | 1. Otwórz /login · 2. Wpisz email · 3. Wpisz błędne hasło · 4. Kliknij „Zaloguj się" |
| **Oczekiwany rezultat** | Brak przekierowania; komunikat o błędnych danych |
| **Rzeczywisty rezultat** | Strona pozostała na /login. Wyświetlono komunikat „Nieprawidłowy login lub hasło". |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-003 — Dodanie nowego użytkownika przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — użytkownicy |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Imię: Jan, Nazwisko: Testowy, Email: jan.testowy@akademik.com |
| **Warunki wstępne** | Zalogowany jako administrator |
| **Kroki** | 1. Przejdź do /dashboard/users · 2. Kliknij „Dodaj użytkownika" · 3. Wypełnij formularz · 4. Kliknij „Zapisz" |
| **Oczekiwany rezultat** | Nowy użytkownik widoczny na liście |
| **Rzeczywisty rezultat** | Użytkownik Jan Testowy pojawił się na liście. Wyświetlono komunikat potwierdzający. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-004 — Zgłoszenie usterki przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Zgłoszenia usterek |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Tytuł: „Awaria ogrzewania", Priorytet: Wysoki; konto: i.kublytskyi@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/issues · 2. Kliknij „Nowe zgłoszenie" · 3. Wypełnij formularz · 4. Kliknij „Wyślij" |
| **Oczekiwany rezultat** | Usterka zapisana ze statusem NEW; widoczna na liście |
| **Rzeczywisty rezultat** | Usterka „Awaria ogrzewania" pojawiła się na liście ze statusem NEW. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-005 — Zmiana statusu usterki przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — usterki |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Usterka ze statusem NEW (z WEB-TC-004) |
| **Warunki wstępne** | Zalogowany jako administrator; usterka ze statusem NEW istnieje |
| **Kroki** | 1. Przejdź do /dashboard/issues · 2. Otwórz usterkę · 3. Zmień status na „IN_PROGRESS" · 4. Zapisz |
| **Oczekiwany rezultat** | Status zmieniony na IN_PROGRESS; mieszkaniec otrzymuje powiadomienie |
| **Rzeczywisty rezultat** | Status usterki zmieniony na IN_PROGRESS. Powiadomienie wysłane do i.kublytskyi@student.com. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-006 — Złożenie skargi przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz skargi |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Treść: „Hałas w nocy z pokoju 205"; konto: i.kublytskyi@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/complaints · 2. Kliknij „Nowa skarga" · 3. Wpisz treść · 4. Kliknij „Wyślij" |
| **Oczekiwany rezultat** | Skarga zapisana ze statusem NEW |
| **Rzeczywisty rezultat** | Skarga pojawiła się na liście ze statusem NEW. Toast „Skarga zarejestrowana" wyświetlony. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-007 — Złożenie anonimowej skargi

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Formularz skargi — tryb anonimowy |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Treść: „Problem z windą"; opcja „Anonimowo" zaznaczona |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/complaints · 2. Kliknij „Nowa skarga" · 3. Wpisz treść · 4. Zaznacz „Anonimowo" · 5. Kliknij „Wyślij" |
| **Oczekiwany rezultat** | Skarga zapisana bez przypisanego użytkownika |
| **Rzeczywisty rezultat** | Skarga zapisana. W panelu admina pole „Autor" puste — anonimowość zachowana. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-008 — Generowanie kodu QR przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Moduł kodów QR |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Konto: i.kublytskyi@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/qr · 2. Kliknij „Wygeneruj kod QR" · 3. Sprawdź wyświetlony kod i datę ważności |
| **Oczekiwany rezultat** | Kod QR wyświetlony; status ACTIVE; data ważności widoczna |
| **Rzeczywisty rezultat** | Kod QR wyświetlony. Status ACTIVE. Data ważności: +24h od generacji. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-009 — Unieważnienie kodu QR przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — kody QR |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Aktywny kod QR mieszkańca (z WEB-TC-008) |
| **Warunki wstępne** | Zalogowany jako administrator; istnieje kod QR ze statusem ACTIVE |
| **Kroki** | 1. Otwórz panel QR (admin) · 2. Znajdź kod QR mieszkańca · 3. Kliknij „Unieważnij" · 4. Potwierdź |
| **Oczekiwany rezultat** | Status kodu zmieniony na REVOKED |
| **Rzeczywisty rezultat** | Status zmieniony na REVOKED. Kod nie może być ponownie użyty. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-010 — Przypisanie mieszkańca do pokoju

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — przypisania |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Użytkownik: Jan Testowy (z WEB-TC-003), Pokój: 101 |
| **Warunki wstępne** | Zalogowany jako administrator; pokój 101 ma wolne miejsca |
| **Kroki** | 1. Przejdź do /dashboard/assignments · 2. Kliknij „Dodaj" · 3. Wybierz użytkownika i pokój · 4. Zapisz |
| **Oczekiwany rezultat** | Przypisanie widoczne na liście |
| **Rzeczywisty rezultat** | Przypisanie Jan Testowy → Pokój 101 widoczne na liście. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-011 — Dodanie wydarzenia osobistego przez mieszkańca

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Kalendarz — wydarzenia osobiste |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Tytuł: „Spotkanie z dziekanem", jutro 10:00–11:00; konto: i.kublytskyi@student.com |
| **Warunki wstępne** | Zalogowany jako mieszkaniec |
| **Kroki** | 1. Przejdź do /dashboard/events · 2. Kliknij „Dodaj wydarzenie" · 3. Wypełnij tytuł i czas · 4. Zapisz |
| **Oczekiwany rezultat** | Wydarzenie widoczne w kalendarzu w wybranym terminie |
| **Rzeczywisty rezultat** | Wydarzenie „Spotkanie z dziekanem" widoczne w kalendarzu na wybraną datę. |
| **Wynik testu** | ☑ Pass |

---

### WEB-TC-012 — Masowe tworzenie inspekcji pokojów przez administratora

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Panel administratora — inspekcje |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Data inspekcji: przyszły tydzień, wszystkie pokoje |
| **Warunki wstępne** | Zalogowany jako administrator; pokoje istnieją w systemie |
| **Kroki** | 1. Przejdź do /dashboard/events · 2. Kliknij „Utwórz inspekcje" · 3. Wybierz datę i pokoje · 4. Kliknij „Generuj" |
| **Oczekiwany rezultat** | Eventy inspekcji widoczne w kalendarzu; mieszkańcy otrzymują powiadomienia |
| **Rzeczywisty rezultat** | Inspekcje utworzone dla wszystkich pokojów. Widoczne w kalendarzu. Powiadomienia wysłane. |
| **Wynik testu** | ☑ Pass |

---

## Część 2. Testy integracji usług (INT-TC)

Scenariusze sprawdzają współpracę usług: import CSV, routing i buforowanie w kolejkach, ponawianie, klucz wewnętrzny oraz unieważnianie kodów QR. Są pisane pod nagranie wideo: każdy krok ma polecenie albo akcję w UI i widoczny rezultat (odpowiedź HTTP, log, kolejka w RabbitMQ, e-mail w Mailpit). Każdy scenariusz ma też odpowiadający test automatyczny.

**Przygotowanie (raz, w Git Bash lub WSL, w katalogu repozytorium):**

```bash
docker compose up -d --build
KEY=$(grep '^INTERNAL_API_KEY=' .env | cut -d= -f2)

login() {
  curl -s -X POST http://localhost/api/core/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" \
  | python -c "import sys,json; print(json.load(sys.stdin)['token']['accessToken'])"
}
ADMIN=$(login admin@akademik.com admin123)
RES=$(login i.kublytskyi@student.com student123)
```

W osobnym terminalu przez cały czas: `docker compose logs -f core-api service-api celery-worker celery-worker-email`.
Mailpit: `http://localhost:8025`. RabbitMQ: `http://localhost:15673`, zakładka *Queues*.

---

### INT-TC-001 — Import poprawnego pliku CSV

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Import wydarzeń z CSV (`scripts/import_events.py`) |
| **Typ testu** | Pozytywny |
| **Dane testowe** | `apps/service-api/scripts/sample_events.csv` (5 wierszy) |
| **Warunki wstępne** | Kontenery działają |
| **Kroki** | 1. `docker compose exec service-api python -m scripts.import_events scripts/sample_events.csv; echo "exit: $?"` · 2. Zaloguj się w UI jako administrator i otwórz /dashboard/events |
| **Oczekiwany rezultat** | Wyjście `imported: 5`, `failed: 0`, `exit: 0`. Zaimportowane wydarzenia (np. „Przegląd pokoju 101”) widoczne w kalendarzu administratora |
| **Test automatyczny** | `tests/test_import_events.py::test_import_sample_events` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-002 — Import pliku z błędnymi wierszami

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Import wydarzeń z CSV — obsługa błędów |
| **Typ testu** | Negatywny |
| **Dane testowe** | Wiersz 2: `user_id=abc`; wiersz 3: nieznany typ `UNKNOWN`; wiersz 4: poprawny |
| **Warunki wstępne** | Kontenery działają |
| **Kroki** | 1. Wykonaj: <br>`docker compose exec service-api sh -c 'printf "user_id,title,description,start_at,end_at,type\nabc,Zly,,2026-12-01T09:00:00,2026-12-01T10:00:00,OTHER\n1,Zly typ,,2026-12-02T09:00:00,2026-12-02T10:00:00,UNKNOWN\n1,Dobry,,2026-12-03T09:00:00,2026-12-03T10:00:00,OTHER\n" > /tmp/bad.csv && python -m scripts.import_events /tmp/bad.csv; echo "exit: $?"'` |
| **Oczekiwany rezultat** | Na stderr `row 2: ...` i `row 3: ...` z przyczyną; na stdout `imported: 1`, `failed: 2`; `exit: 1`. Poprawny wiersz („Dobry”) zapisany |
| **Test automatyczny** | `tests/test_import_events.py::test_import_skips_invalid_rows` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-003 — Routing powiadomień i e-mail po zamknięciu usterki

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Routing kanał → kolejka; worker e-mail → core-api → SMTP |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Nowa usterka mieszkańca `i.kublytskyi@student.com` |
| **Warunki wstępne** | Wszystkie kontenery działają |
| **Kroki** | 1. Utwórz usterkę: `curl -s -X POST http://localhost/api/service/v1/issues -H "Authorization: Bearer $RES" -H "Content-Type: application/json" -d '{"room_id":1,"title":"Cieknący kran"}'` — zanotuj `id` · 2. Zamknij ją jako admin: `curl -s -X PATCH http://localhost/api/service/v1/issues/<id>/status -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" -d '{"status":"CLOSED"}'` · 3. Sprawdź logi · 4. Otwórz Mailpit |
| **Oczekiwany rezultat** | Odpowiedź 200 ze `status: CLOSED`. W logach service-api: `notify: routing channel=APP to queue=notifications.app` oraz `notify: routing channel=EMAIL to queue=notifications.email`. W logach core-api: `Integration: internal lookup for user 2`. W logach celery-worker-email: `send_email: delivered notification for user 2`. W Mailpit e-mail „Issue closed” do `i.kublytskyi@student.com` |
| **Test automatyczny** | `tests/test_integration.py::test_email_notification_goes_to_email_queue`, `::test_app_notification_goes_to_app_queue`, `tests/test_contract.py::test_send_email_delivers_address_from_core_api` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-004 — Buforowanie e-maili przy zatrzymanym workerze

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Buforowanie wiadomości w RabbitMQ |
| **Typ testu** | Odporność na awarię |
| **Dane testowe** | Nowa usterka mieszkańca |
| **Warunki wstępne** | Wszystkie kontenery działają |
| **Kroki** | 1. `docker compose stop celery-worker-email` · 2. Utwórz i zamknij nową usterkę (kroki 1–2 z INT-TC-003) · 3. W RabbitMQ (*Queues*) sprawdź kolejkę `notifications.email` · 4. Sprawdź Mailpit · 5. `docker compose start celery-worker-email` · 6. Ponownie sprawdź kolejkę i Mailpit |
| **Oczekiwany rezultat** | Po kroku 2 zamknięcie usterki działa (200). W kroku 3 kolejka `notifications.email` ma 1 wiadomość *Ready*, w Mailpit brak nowego e-maila. Po starcie workera kolejka spada do 0, w Mailpit pojawia się e-mail „Issue closed”, w logach `send_email: delivered` |
| **Test automatyczny** | brak (wymaga brokera); routing sprawdza `tests/test_integration.py::test_email_notification_goes_to_email_queue` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-005 — Ponawianie wysyłki e-maila i zapis FAILED

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Ponawianie z backoffem (`send_email`, 6 prób: odstępy 1, 2, 4, 8, 16 s) |
| **Typ testu** | Odporność na awarię |
| **Dane testowe** | Nowa usterka mieszkańca |
| **Warunki wstępne** | Wszystkie kontenery działają |
| **Kroki** | 1. `docker compose stop mailpit` · 2. Utwórz i zamknij nową usterkę (kroki 1–2 z INT-TC-003) · 3. Obserwuj logi celery-worker-email przez ok. 35 s · 4. `curl -s http://localhost/api/service/v1/notifications -H "Authorization: Bearer $ADMIN"` · 5. `docker compose start mailpit` |
| **Oczekiwany rezultat** | W logach kolejno `send_email: attempt 1 failed ...` … `attempt 6 failed ...`, następnie `send_email: giving up for user 2 after 6 attempts`. W kroku 4 na liście powiadomienie `channel: EMAIL`, `title: Issue closed`, `status: FAILED`. Usterka pozostaje zamknięta |
| **Test automatyczny** | `tests/test_integration.py::test_send_email_retries_when_lookup_fails`, `::test_send_email_saves_failed_after_last_retry` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-006 — Klucz wewnętrzny: 401 bez klucza, 204/200 z kluczem

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Uwierzytelnienie między usługami (`X-Api-Key`) |
| **Typ testu** | Pozytywny i negatywny |
| **Dane testowe** | `INTERNAL_API_KEY` z `.env`; nieistniejący użytkownik 999; mieszkaniec id 2 |
| **Warunki wstępne** | Kontenery działają |
| **Kroki** | 1. `curl -i -X POST http://localhost/api/service/internal/users/999/deleted` · 2. `curl -i -X POST http://localhost/api/service/internal/users/999/deleted -H "X-Api-Key: zly-klucz"` · 3. `curl -i -X POST http://localhost/api/service/internal/users/999/deleted -H "X-Api-Key: $KEY"` · 4. `curl -i http://localhost/api/core/internal/users/2` · 5. `curl -i http://localhost/api/core/internal/users/2 -H "X-Api-Key: $KEY"` |
| **Oczekiwany rezultat** | 1–2: `401` z `Invalid or missing API key`. 3: `204 No Content`. 4: `401`, w logach core-api `Integration: rejected internal request for user 2`. 5: `200` z `email: i.kublytskyi@student.com` |
| **Test automatyczny** | `tests/test_integration.py::test_user_deleted_without_key_returns_401`, `::test_user_deleted_with_wrong_key_returns_401`, `::test_user_deleted_unknown_user_returns_204`; `InternalApiTests.cs` (4 testy) |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-007 — Usunięcie użytkownika unieważnia jego kody QR

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | core-api → service-api: zdarzenie „użytkownik usunięty” |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Użytkownik Jan Testowy (z WEB-TC-003) z aktywnym kodem QR |
| **Warunki wstępne** | Wszystkie kontenery działają; Jan Testowy istnieje i zna swoje hasło |
| **Kroki** | 1. Zaloguj się w UI jako Jan Testowy i wygeneruj kod QR (/dashboard/qr) · 2. Jako admin sprawdź listę: `curl -s http://localhost/api/service/v1/qr-codes -H "Authorization: Bearer $ADMIN"` — kod Jana ma `ACTIVE`; zanotuj `user_id` i `token` · 3. Usuń Jana w UI (/dashboard/users) albo `curl -i -X DELETE http://localhost/api/core/users/<user_id> -H "Authorization: Bearer $ADMIN"` · 4. Sprawdź logi · 5. Powtórz krok 2 · 6. `curl -i -X POST http://localhost/api/service/v1/qr-codes/validate -H "Content-Type: application/json" -d '{"token":"<token>"}'` |
| **Oczekiwany rezultat** | Krok 3: `200`. Logi core-api: `Integration: POST .../internal/users/<id>/deleted (user deleted)` i `Integration: service-api answered 204`. Logi service-api: `user_deleted: revoked 1 active QR codes for user <id>`. Krok 5: kod ma status `REVOKED`. Krok 6: `403` |
| **Test automatyczny** | `tests/test_integration.py::test_user_deleted_revokes_active_qr_codes` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-008 — Usunięcie użytkownika przy niedostępnym service-api (znana luka)

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Ponawianie core-api → service-api, limit czasu; znana luka nr 1 z `docs/integration.md` |
| **Typ testu** | Odporność na awarię |
| **Dane testowe** | Nowy użytkownik z aktywnym kodem QR (utwórz jak w WEB-TC-003 i INT-TC-007, krok 1) |
| **Warunki wstępne** | Użytkownik ma kod QR `ACTIVE` |
| **Kroki** | 1. `docker compose stop service-api` · 2. `time curl -i -X DELETE http://localhost/api/core/users/<user_id> -H "Authorization: Bearer $ADMIN"` · 3. Sprawdź logi core-api · 4. `docker compose start service-api` · 5. Sprawdź listę kodów QR (krok 2 z INT-TC-007) · 6. Napraw ręcznie: `curl -i -X POST http://localhost/api/service/internal/users/<user_id>/deleted -H "X-Api-Key: $KEY"` i ponownie sprawdź listę |
| **Oczekiwany rezultat** | Krok 2: `200` w czasie nie dłuższym niż ok. 5 s; użytkownik usunięty. Krok 3: `Integration: failed to notify service-api about deleted user <id>`. Krok 5: kod QR nadal `ACTIVE` — zdarzenie zostało utracone (znana luka). Krok 6: `204`, kod `REVOKED` |
| **Test automatyczny** | `ServiceApiClientResilienceTests.cs::NotifyUserDeleted_WhenServiceApiHangs_GivesUpWithinTotalTimeout` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

### INT-TC-009 — Skrzynka administratora i anonimowość skargi

| Pole | Wartość |
|------|---------|
| **Funkcjonalność** | Powiadomienie administratorów o nowej skardze |
| **Typ testu** | Pozytywny |
| **Dane testowe** | Skarga anonimowa i zwykła od `i.kublytskyi@student.com` |
| **Warunki wstępne** | Wszystkie kontenery działają |
| **Kroki** | 1. `curl -s -X POST http://localhost/api/service/v1/complaints -H "Authorization: Bearer $RES" -H "Content-Type: application/json" -d '{"room_id":1,"content":"Hałas w nocy","is_anonymous":true}'` · 2. To samo z `"is_anonymous":false` · 3. Jako admin: /dashboard/notifications albo `curl -s http://localhost/api/service/v1/notifications -H "Authorization: Bearer $ADMIN"` · 4. Jako mieszkaniec: `curl -s http://localhost/api/service/v1/notifications -H "Authorization: Bearer $RES"` |
| **Oczekiwany rezultat** | Admin widzi dwa powiadomienia „New complaint”: `Complaint #N was filed anonymously.` (bez autora) i `Complaint #M was filed by user #2.` Mieszkaniec nie widzi powiadomień „New complaint”; widzi tylko „Complaint registered” dla skargi zwykłej |
| **Test automatyczny** | `tests/test_complaints.py`, `tests/test_notification_delivery.py::test_admin_inbox_visible_to_admin_but_not_to_residents` |
| **Rzeczywisty rezultat** | Zgodny z oczekiwanym rezultatem. |
| **Wynik testu** | ☑ Pass |

---

## Raport z testów

### Testy interfejsu (WEB-TC)

| ID | Scenariusz | Typ | Wynik | Status |
|----|-----------|-----|-------|--------|
| WEB-TC-001 | Logowanie z poprawnymi danymi | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-002 | Logowanie z błędnym hasłem | Negatywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-003 | Dodanie użytkownika przez admina | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-004 | Zgłoszenie usterki | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-005 | Zmiana statusu usterki | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-006 | Złożenie skargi | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-007 | Anonimowa skarga | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-008 | Generowanie kodu QR | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-009 | Unieważnienie kodu QR | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-010 | Przypisanie mieszkańca do pokoju | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-011 | Dodanie wydarzenia osobistego | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| WEB-TC-012 | Masowe inspekcje pokojów | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |

**Środowisko:** http://localhost · Chrome 147 · Windows 11 Pro  
**Łącznie:** 12 testów · 12 Pass · 0 Fail  
**Pokrycie user flow:** ~100% (logowanie, użytkownicy, pokoje, usterki, skargi, QR, wydarzenia)

### Testy integracji (INT-TC)

| ID | Scenariusz | Typ | Wynik | Status |
|----|-----------|-----|-------|--------|
| INT-TC-001 | Import poprawnego pliku CSV | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-002 | Import pliku z błędnymi wierszami | Negatywny | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-003 | Routing powiadomień i e-mail po zamknięciu usterki | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-004 | Buforowanie e-maili przy zatrzymanym workerze | Odporność | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-005 | Ponawianie wysyłki e-maila i zapis FAILED | Odporność | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-006 | Klucz wewnętrzny 401 / 204 / 200 | Poz. i neg. | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-007 | Usunięcie użytkownika unieważnia kody QR | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-008 | Usunięcie użytkownika przy niedostępnym service-api | Odporność | Zgodny z oczekiwaniami | ✅ Pass |
| INT-TC-009 | Skrzynka administratora i anonimowość skargi | Pozytywny | Zgodny z oczekiwaniami | ✅ Pass |

**Łącznie:** 9 testów · 9 Pass · 0 Fail  

Testy automatyczne: 47 testów pytest (service-api) i 9 testów xUnit (core-api) — polecenia w `README.md`, sekcja *Testy*.
