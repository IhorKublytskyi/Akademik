# Integracja systemu Akademik — dokumentacja techniczna

Dokument opisuje, jak współpracują ze sobą usługi systemu Akademik: architekturę, przepływy integracyjne, kolejki, ponawianie, logowanie, znane awarie i ograniczenia oraz polecenia do uruchomienia i przetestowania całości.

Spis treści:

1. [Architektura](#1-architektura)
2. [Kanały komunikacji](#2-kanały-komunikacji)
3. [Przepływ 1: usunięcie użytkownika → unieważnienie kodów QR](#3-przepływ-1-usunięcie-użytkownika--unieważnienie-kodów-qr)
4. [Przepływ 2: zamknięcie usterki → e-mail do mieszkańca](#4-przepływ-2-zamknięcie-usterki--e-mail-do-mieszkańca)
5. [Kolejki i routing powiadomień](#5-kolejki-i-routing-powiadomień)
6. [Import zdarzeń z pliku CSV](#6-import-zdarzeń-z-pliku-csv)
7. [Zdarzenia integracyjne i logowanie](#7-zdarzenia-integracyjne-i-logowanie)
8. [Mapowanie wymagań na pliki](#8-mapowanie-wymagań-na-pliki)
9. [Awarie, skutki i sposób przywrócenia](#9-awarie-skutki-i-sposób-przywrócenia)
10. [Uruchomienie i testowanie](#10-uruchomienie-i-testowanie)

---

## 1. Architektura

System składa się z dwóch usług backendowych, frontendu, dwóch workerów Celery, harmonogramu Celery Beat oraz infrastruktury (PostgreSQL, RabbitMQ, Mailpit), uruchamianych przez Docker Compose. Ruch z przeglądarki przechodzi przez nginx.

```mermaid
flowchart LR
    user([Przeglądarka])

    subgraph edge[Warstwa wejściowa]
        nginx[nginx :80]
    end

    subgraph app[Warstwa aplikacji]
        web[web<br/>Next.js :3000]
        core[core-api<br/>ASP.NET Core 9<br/>:3001 → 8080]
        svc[service-api<br/>FastAPI :3002]
    end

    subgraph async[Przetwarzanie asynchroniczne]
        beat[celery-beat<br/>harmonogram]
        w1[celery-worker<br/>celery, notifications.app,<br/>notifications.sms]
        w2[celery-worker-email<br/>notifications.email]
    end

    subgraph infra[Infrastruktura]
        pg[(PostgreSQL 16<br/>:5432)]
        mq[[RabbitMQ 3<br/>:5672, UI :15673]]
        mail[Mailpit<br/>SMTP :1025, UI :8025]
    end

    user --> nginx
    nginx -- "/" --> web
    nginx -- "/api/core/*" --> core
    nginx -- "/api/service/*" --> svc

    core -- "POST /api/service/internal/users/{id}/deleted<br/>X-Api-Key" --> svc
    w2 -- "GET /api/core/internal/users/{id}<br/>X-Api-Key" --> core

    svc -- "zadania Celery (AMQP)" --> mq
    beat -- "zadania okresowe" --> mq
    mq --> w1
    mq --> w2
    w2 -- SMTP --> mail

    core --> pg
    svc --> pg
    w1 --> pg
    w2 --> pg
```

Ten sam diagram jako obraz: [`docs/diagrams/architektura.png`](diagrams/architektura.png).

| Komponent | Technologia | Odpowiedzialność |
|-----------|-------------|------------------|
| `nginx` | nginx (alpine) | Reverse proxy: `/` → web, `/api/core/` → core-api, `/api/service/` → service-api |
| `web` | Next.js 16, React 19 | Interfejs mieszkańca i administratora |
| `core-api` | ASP.NET Core 9 (`net9.0`), EF Core | Logowanie, JWT, użytkownicy, pokoje, przydziały; wewnętrzny endpoint z adresem e-mail użytkownika |
| `service-api` | Python 3.12, FastAPI, SQLAlchemy (async), Alembic | Usterki, skargi, zdarzenia, kody QR, powiadomienia; wewnętrzny endpoint „użytkownik usunięty” |
| `migrate` | obraz service-api | Jednorazowo uruchamia `alembic upgrade head` przed startem service-api |
| `celery-worker` | Celery 5 | Kolejki `celery`, `notifications.app`, `notifications.sms` — zapis powiadomień w aplikacji, zadania okresowe |
| `celery-worker-email` | Celery 5 | Kolejka `notifications.email` — pobranie adresu z core-api i wysłanie e-maila przez SMTP |
| `celery-beat` | Celery Beat | Harmonogram: przypomnienia o płatnościach (codziennie 08:00 UTC), ponawianie powiadomień (co 30 min) |
| `postgres` | PostgreSQL 16 | Jedna instancja i jedna baza dla core-api i service-api (osobne tabele) |
| `rabbitmq` | RabbitMQ 3 (management) | Broker wiadomości Celery |
| `mailpit` | Mailpit | Testowy serwer SMTP; skrzynka podglądowa pod `http://localhost:8025` |

---

## 2. Kanały komunikacji

| Od → do | Kanał | Uwierzytelnienie | Cel |
|---------|-------|------------------|-----|
| przeglądarka → core-api / service-api | HTTP przez nginx | JWT (Bearer) | Wszystkie operacje użytkownika |
| core-api → service-api | HTTP, synchronicznie | nagłówek `X-Api-Key` | Powiadomienie o usunięciu użytkownika |
| celery-worker-email → core-api | HTTP, synchronicznie | nagłówek `X-Api-Key` | Pobranie adresu e-mail użytkownika |
| service-api → RabbitMQ → workery | AMQP (Celery), asynchronicznie | dane logowania RabbitMQ | Powiadomienia APP / EMAIL / SMS |
| celery-beat → RabbitMQ → celery-worker | AMQP (Celery) | dane logowania RabbitMQ | Zadania okresowe |
| celery-worker-email → Mailpit | SMTP | brak (środowisko testowe) | Wysłanie wiadomości e-mail |

**JWT.** Token wystawia core-api (`sub` = id użytkownika, rola w claimie `role`). service-api weryfikuje podpis tym samym sekretem `JWT_SECRET`, a także `iss` i `aud` (`akademik`).

**Klucz wewnętrzny.** Oba wewnętrzne endpointy wymagają nagłówka `X-Api-Key` równego `INTERNAL_API_KEY`. Klucz porównywany jest w czasie stałym (`hmac.compare_digest` w Pythonie, `CryptographicOperations.FixedTimeEquals` w C#). **Wartość musi być identyczna w obu usługach**: w Docker Compose core-api dostaje ją jako `Integration__ApiKey`, a service-api i workery jako `INTERNAL_API_KEY`, obie z tej samej zmiennej w `.env`.

| Endpoint wewnętrzny | Brak / zły klucz | Poprawny klucz |
|---------------------|------------------|----------------|
| `GET /api/core/internal/users/{id}` (core-api) | `401` | `200` z `{id, email, firstName, lastName}` lub `404` dla nieznanego id |
| `POST /api/service/internal/users/{id}/deleted` (service-api) | `401` | `204` (również dla nieznanego id — operacja idempotentna) |

> Uwaga: nginx przekazuje całe prefiksy `/api/core/` i `/api/service/`, więc oba endpointy wewnętrzne są osiągalne także z zewnątrz pod `http://localhost/...`. Chroni je wyłącznie klucz `X-Api-Key`.

---

## 3. Przepływ 1: usunięcie użytkownika → unieważnienie kodów QR

Administrator usuwa konto w core-api. Po usunięciu core-api informuje service-api, które zmienia status wszystkich aktywnych kodów QR tego użytkownika na `REVOKED`.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant Core as core-api
    participant DB1 as PostgreSQL (users)
    participant Svc as service-api
    participant DB2 as PostgreSQL (qr_codes)

    Admin->>Core: DELETE /api/core/users/{id} (JWT, rola Admin)
    Core->>DB1: DELETE użytkownika
    DB1-->>Core: OK
    Note over Core: log: Integration: POST .../internal/users/{id}/deleted
    Core->>Svc: POST /api/service/internal/users/{id}/deleted<br/>X-Api-Key
    alt klucz poprawny
        Svc->>DB2: UPDATE qr_codes SET status=REVOKED<br/>WHERE user_id={id} AND status=ACTIVE
        DB2-->>Svc: liczba zmienionych wierszy
        Note over Svc: log: user_deleted: revoked N active QR codes for user {id}
        Svc-->>Core: 204 No Content
    else brak / zły klucz
        Svc-->>Core: 401
    end
    Note over Core: log: Integration: service-api answered {status}
    alt service-api niedostępne lub błąd
        Note over Core: 2 ponowienia (200 ms, backoff wykładniczy),<br/>timeout próby 2 s, łącznie maks. 5 s,<br/>potem log ostrzegawczy
    end
    Core-->>Admin: 200 OK (użytkownik usunięty w każdym przypadku)
```

Implementacja:

- `apps/core-api/src/Akademik/Program.cs` — endpoint `DELETE /api/core/users/{id}`; błąd integracji jest łapany i logowany, nie zmienia odpowiedzi.
- `apps/core-api/src/Akademik.Services/Integration/ServiceApiClient.cs` — wywołanie HTTP.
- `apps/core-api/src/Akademik/Integration/ServiceApiClientRegistration.cs` — `AddStandardResilienceHandler`: timeout próby 2 s, 2 ponowienia od 200 ms, łączny limit 5 s.
- `apps/service-api/src/presentation/api/v1/internal_router.py` — endpoint wewnętrzny.
- `apps/service-api/src/application/services/qr_service.py` — `revoke_user_qr_codes`.

---

## 4. Przepływ 2: zamknięcie usterki → e-mail do mieszkańca

Gdy administrator zmienia status usterki na `CLOSED`, service-api wysyła dwa powiadomienia: o zmianie statusu (kanał APP) i o zamknięciu (kanał EMAIL). Router kieruje je do różnych kolejek. Worker e-mail pobiera adres z core-api i wysyła wiadomość przez SMTP.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant Svc as service-api
    participant Router as RabbitMQNotificationService
    participant MQ as RabbitMQ
    participant WA as celery-worker
    participant WE as celery-worker-email
    participant Core as core-api
    participant SMTP as Mailpit (SMTP)
    participant DB as PostgreSQL

    Admin->>Svc: PATCH /api/service/v1/issues/{id}/status {"status":"CLOSED"}
    Svc->>DB: UPDATE issues (status=CLOSED, closed_at)
    Svc->>Router: notify(channel=APP, "Issue status changed")
    Router->>MQ: deliver_notification → notifications.app
    Svc->>Router: notify(channel=EMAIL, "Issue closed")
    Note over Router: log: notify: routing channel=EMAIL to queue=notifications.email
    Router->>MQ: send_email → notifications.email
    Svc-->>Admin: 200 OK (nie czeka na dostarczenie)

    MQ->>WA: deliver_notification
    WA->>DB: INSERT notifications (APP, SENT)

    MQ->>WE: send_email (acks_late)
    WE->>Core: GET /api/core/internal/users/{user_id} (X-Api-Key, timeout 3 s)
    Core-->>WE: 200 {email, ...}
    WE->>SMTP: wiadomość „Issue closed”
    alt sukces
        WE->>DB: INSERT notifications (EMAIL, SENT)
        Note over WE: log: send_email: delivered notification for user {id}
    else błąd (core-api, SMTP)
        Note over WE: log: attempt N failed, ponowienie po 2^N s
        Note over WE: po 6. nieudanej próbie: log „giving up”<br/>INSERT notifications (EMAIL, FAILED)
    end
```

Implementacja:

- `apps/service-api/src/application/services/issue_service.py` — `update_issue_status`; błąd wysyłki powiadomienia jest logowany i nie blokuje zmiany statusu.
- `apps/service-api/src/application/services/rabbitmq_notification_service.py` — routing kanał → zadanie → kolejka.
- `apps/service-api/src/application/tasks/send_email_task.py` — lookup w core-api, SMTP, ponawianie, zapis wyniku.
- `apps/service-api/src/application/tasks/deliver_notification_task.py` — zapis powiadomienia w aplikacji.
- `apps/core-api/src/Akademik/Program.cs` — `GET /api/core/internal/users/{id}`.

---

## 5. Kolejki i routing powiadomień

Kolejki zdefiniowane w `apps/service-api/src/infrastructure/celery/celery_app.py`:

| Kolejka | Zadania | Worker |
|---------|---------|--------|
| `celery` (domyślna) | `check_payment_deadlines`, `retry_failed_notifications` (z harmonogramu) | `celery-worker` |
| `notifications.app` | `deliver_notification` (kanał APP) | `celery-worker` |
| `notifications.sms` | `deliver_notification` (kanał SMS — zapis w bazie, bez bramki SMS) | `celery-worker` |
| `notifications.email` | `send_email` (kanał EMAIL) | `celery-worker-email` |

**Routing.** `CHANNEL_ROUTES` w `rabbitmq_notification_service.py` przypisuje każdemu kanałowi parę (zadanie, kolejka). Osobny worker dla e-maili sprawia, że wolne SMTP lub niedostępne core-api nie blokują powiadomień w aplikacji.

**Buforowanie.** Wiadomości czekają w RabbitMQ, dopóki worker danej kolejki nie jest dostępny. Zatrzymanie `celery-worker-email` nie powoduje utraty e-maili: trafiają do `notifications.email` i są wysyłane po ponownym starcie workera. Zadanie `send_email` ma `acks_late=True`, więc wiadomość jest potwierdzana dopiero po wykonaniu zadania; przerwanie workera w trakcie wysyłki powoduje ponowne dostarczenie wiadomości.

**Ponawianie.**

| Miejsce | Strategia | Po wyczerpaniu prób |
|---------|-----------|---------------------|
| `send_email` | do 5 ponowień (łącznie 6 prób), odstęp `2^n` s: 1, 2, 4, 8, 16 s | zapis powiadomienia EMAIL ze statusem `FAILED`, log `giving up` |
| core-api → service-api | 2 ponowienia od 200 ms (backoff wykładniczy), timeout próby 2 s, łącznie maks. 5 s | log ostrzegawczy; użytkownik pozostaje usunięty |
| `retry_failed_notifications` (co 30 min) | zmienia `FAILED` na `PENDING` i zwiększa `retry_count` (maks. 3) | — (patrz znane luki w rozdz. 9) |

**Skrzynka administratora.** Nowa skarga generuje powiadomienie dla administratorów (`user_id = 0`, stała `ADMIN_INBOX_USER_ID`). Przy skardze anonimowej treść brzmi `Complaint #N was filed anonymously.` i celowo nie zawiera autora; przy zwykłej — `Complaint #N was filed by user #ID.`, a autor dostaje dodatkowo powiadomienie „Complaint registered”. Administrator widzi wszystkie powiadomienia, mieszkaniec tylko własne.

---

## 6. Import zdarzeń z pliku CSV

Skrypt `apps/service-api/scripts/import_events.py` wczytuje zdarzenia (inspekcje, terminy płatności, inne) z pliku CSV do tabeli `events`. Każdy wiersz jest zapisywany ze źródłem `ADMIN`.

**Polecenie** (w działającym środowisku Docker):

```bash
docker compose exec service-api python -m scripts.import_events scripts/sample_events.csv
```

Lokalnie, z katalogu `apps/service-api`, z ustawionym `DATABASE_URL`:

```bash
poetry run python -m scripts.import_events scripts/sample_events.csv
```

**Format pliku** — UTF-8, nagłówek w pierwszym wierszu:

| Kolumna | Typ | Opis |
|---------|-----|------|
| `user_id` | liczba całkowita | id użytkownika z core-api |
| `title` | tekst | tytuł zdarzenia |
| `description` | tekst, może być pusty | opis (pusty → `NULL`) |
| `start_at` | data ISO 8601, np. `2026-12-01T09:00:00` | początek |
| `end_at` | data ISO 8601 | koniec |
| `type` | `ROOM_INSPECTION`, `PAYMENT` lub `OTHER` (wielkość liter bez znaczenia) | typ zdarzenia |

Przykład (`scripts/sample_events.csv`):

```csv
user_id,title,description,start_at,end_at,type
1,Przegląd pokoju 101,Kwartalna inspekcja techniczna,2026-12-01T09:00:00,2026-12-01T10:00:00,ROOM_INSPECTION
1,Termin płatności grudzień,Czynsz za grudzień 2026,2026-12-10T00:00:00,2026-12-10T23:59:00,PAYMENT
```

**Wynik.** Na standardowe wyjście:

```
imported: 5
failed: 0
```

Błędne wiersze są pomijane, a na standardowe wyjście błędów trafia numer wiersza i przyczyna, np. `row 3: invalid literal for int() with base 10: 'abc'`. Poprawne wiersze z tego samego pliku są zapisywane.

**Kod wyjścia:** `0` — wszystkie wiersze zaimportowane; `1` — co najmniej jeden wiersz nieudany albo złe wywołanie (brak argumentu).

Testy: `apps/service-api/tests/test_import_events.py`.

---

## 7. Zdarzenia integracyjne i logowanie

**Loggery.**

- service-api i workery: standardowy moduł `logging` Pythona. Zdarzenia integracyjne trafiają do loggera o nazwie `integration`; zadania okresowe logują pod nazwą swojego modułu. Poziom `INFO` ustawia `logging.basicConfig` w `src/main.py`; workery Celery uruchamiane są z `--loglevel=info`.
- core-api: `ILogger` ASP.NET Core; wszystkie komunikaty integracyjne zaczynają się od `Integration:`.
- Logi trafiają na stdout kontenerów, więc odczytuje się je przez `docker compose logs`.

**Zdarzenia.**

| Usługa | Poziom | Komunikat | Kiedy |
|--------|--------|-----------|-------|
| core-api | Information | `Integration: POST {BaseAddress}{Path} (user deleted)` | przed wywołaniem service-api |
| core-api | Information | `Integration: service-api answered {StatusCode} for deleted user {UserId}` | po odpowiedzi |
| core-api | Warning | `Integration: failed to notify service-api about deleted user {UserId}` | po wyczerpaniu ponowień |
| core-api | Warning | `Integration: rejected internal request for user {UserId} (missing or invalid API key)` | zły klucz na endpoincie wewnętrznym |
| core-api | Information | `Integration: internal lookup for user {UserId}` / `... for unknown user {UserId}` | lookup adresu e-mail |
| service-api | INFO | `notify: routing channel=EMAIL to queue=notifications.email task=...` | każde powiadomienie |
| service-api | INFO | `user_deleted: revoked N active QR codes for user ID` | endpoint „użytkownik usunięty” |
| service-api | WARNING | `Notification failed` (ze stosem wyjątku) | broker niedostępny przy wysyłce powiadomienia |
| celery-worker-email | WARNING | `send_email: attempt N failed for user ID: <błąd>` | nieudana próba |
| celery-worker-email | ERROR | `send_email: giving up for user ID after 6 attempts` | wyczerpanie ponowień |
| celery-worker-email | INFO | `send_email: delivered notification for user ID` | sukces |
| celery-worker | INFO | `payment_deadline_task: created N notifications` | zadanie okresowe |
| celery-worker | INFO | `notification_retry_task: re-queued N notifications` | zadanie okresowe |

**Odczyt logów:**

```bash
# wszystkie usługi biorące udział w integracji, na bieżąco
docker compose logs -f core-api service-api celery-worker celery-worker-email

# tylko zdarzenia integracyjne
docker compose logs core-api | grep "Integration:"
docker compose logs service-api celery-worker-email | grep -E "notify:|user_deleted|send_email"

# ostatnie 100 linii workera e-mail
docker compose logs --tail=100 celery-worker-email
```

Podgląd stanu kolejek: panel RabbitMQ `http://localhost:15673` (login i hasło z `RABBITMQ_USER` / `RABBITMQ_PASS`), zakładka *Queues*. Wysłane e-maile: `http://localhost:8025`.

---

## 8. Mapowanie wymagań na pliki

| Wymaganie | Implementacja | Testy |
|-----------|---------------|-------|
| Import danych z pliku (CSV), raport wyniku, kod wyjścia | `apps/service-api/scripts/import_events.py`, `scripts/sample_events.csv` | `tests/test_import_events.py` |
| Komunikacja synchroniczna core-api → service-api | `Akademik.Services/Integration/ServiceApiClient.cs`, `Akademik/Program.cs` (`DELETE /api/core/users/{id}`), `service-api/.../v1/internal_router.py` | `tests/test_integration.py`, `ServiceApiClientResilienceTests.cs` |
| Komunikacja synchroniczna worker → core-api (lookup e-maila) | `service-api/.../tasks/send_email_task.py` (`fetch_user_email`), `Akademik/Program.cs` (`GET /api/core/internal/users/{id}`) | `tests/test_contract.py`, `InternalApiTests.cs` |
| Uwierzytelnienie między usługami (`X-Api-Key`, 401/204) | `service-api/src/presentation/dependencies.py` (`require_api_key`), `Akademik/Program.cs` (`IsValidApiKey`) | `tests/test_integration.py`, `InternalApiTests.cs` |
| Unieważnienie kodów QR po usunięciu użytkownika | `service-api/.../services/qr_service.py` (`revoke_user_qr_codes`) | `tests/test_integration.py` |
| Komunikacja asynchroniczna przez brokera | `service-api/src/infrastructure/celery/celery_app.py`, `docker-compose.yml` (rabbitmq, workery) | `tests/test_integration.py` |
| Routing wiadomości do kolejek wg kanału | `service-api/.../services/rabbitmq_notification_service.py` (`CHANNEL_ROUTES`) | `tests/test_integration.py` (`test_channel_routes_cover_every_channel`, `test_email_notification_goes_to_email_queue`, `test_app_notification_goes_to_app_queue`) |
| Buforowanie (kolejki, `acks_late`, osobny worker e-mail) | `celery_app.py`, `send_email_task.py`, `docker-compose.yml` (`celery-worker-email -Q notifications.email`) | scenariusz INT-TC-004 w `docs/tests/scenarios.md` |
| Ponawianie z backoffem | `send_email_task.py` (`max_retries=5`, `2**attempt`), `Akademik/Integration/ServiceApiClientRegistration.cs` | `tests/test_integration.py` (`test_send_email_retries_when_lookup_fails`, `test_send_email_saves_failed_after_last_retry`), `ServiceApiClientResilienceTests.cs` |
| Wysyłka e-mail (SMTP) | `send_email_task.py` (`send_smtp_message`), `docker-compose.yml` (mailpit), `infrastructure/config.py` (`SMTP_*`) | `tests/test_contract.py` (`test_send_email_delivers_address_from_core_api`), `tests/test_integration.py` |
| Zadania okresowe | `celery_app.py` (`beat_schedule`), `tasks/payment_deadline_task.py`, `tasks/notification_retry_task.py` | `tests/test_tasks.py` |
| Powiadomienia administratora, anonimowość skarg | `services/complaint_service.py`, `domain/entities/notification.py` (`ADMIN_INBOX_USER_ID`), `services/notification_read_service.py` | `tests/test_complaints.py`, `tests/test_notification_delivery.py` |
| Odporność: błąd powiadomienia nie blokuje operacji | `issue_service.py`, `complaint_service.py`, `event_service.py` (`try/except` wokół `notify`), `Program.cs` (`DELETE /users`) | `tests/test_issues.py`, `tests/test_complaints.py` |
| Logowanie zdarzeń integracyjnych | logger `integration` w `send_email_task.py`, `rabbitmq_notification_service.py`, `internal_router.py`; `ILogger` w `Program.cs`, `ServiceApiClient.cs` | — (odczyt: rozdz. 7) |
| Wspólne uwierzytelnienie JWT | `Akademik.Services/JwtAuthorization/JwtService.cs`, `service-api/src/infrastructure/auth/jwt_validator.py` | `AuthTests.cs` |
| Konfiguracja i uruchomienie całości | `docker-compose.yml`, `.env.example`, `nginx/nginx.conf` | — |

Ścieżki `tests/...`, `services/...`, `tasks/...` odnoszą się do `apps/service-api/` (`services` i `tasks` w `src/application/`); pliki `*.cs` z testami leżą w `apps/core-api/src/Akademik.IntegrationTests/`.

---

## 9. Awarie, skutki i sposób przywrócenia

| Awaria | Skutek | Przywrócenie |
|--------|--------|--------------|
| **RabbitMQ niedostępny** — pojedynczy punkt awarii (jedna instancja, brak klastra) | Zapis usterek, skarg i zdarzeń działa, ale `notify` rzuca wyjątek, który jest logowany jako `Notification failed`; **te powiadomienia giną**. Zadania okresowe i workery stoją. | `docker compose up -d rabbitmq`; zadania z harmonogramu wykonają się przy następnym terminie. Utraconych powiadomień nie da się odtworzyć automatycznie. |
| **PostgreSQL niedostępny** — pojedynczy punkt awarii (jedna instancja i jedna baza dla obu usług) | core-api i service-api zwracają błędy 500, logowanie nie działa, workery nie zapisują powiadomień. Cały system jest niedostępny. | `docker compose up -d postgres`; usługi łączą się ponownie przy kolejnych żądaniach (`NullPool` w service-api). Dane są w wolumenie `postgres_data`. |
| service-api niedostępne | Funkcje usterek, skarg, QR i zdarzeń niedostępne. Usunięcie użytkownika w core-api się udaje (po maks. ~5 s), ale **kody QR pozostają aktywne** (patrz luka 1). | `docker compose up -d service-api`; kody QR usuniętych w tym czasie użytkowników trzeba unieważnić ręcznie (patrz luka 1). |
| core-api niedostępne | Logowanie i zarządzanie użytkownikami niedostępne. Worker e-mail nie pobierze adresu: ponawia 6 razy (ok. 31 s), potem zapisuje powiadomienie `FAILED`. | `docker compose up -d core-api`. E-maile oznaczone `FAILED` nie są wysyłane ponownie (patrz luka 2). |
| `celery-worker-email` zatrzymany | E-maile czekają w kolejce `notifications.email`; nic nie ginie. | `docker compose up -d celery-worker-email` — zaległe wiadomości są wysyłane. |
| `celery-worker` zatrzymany | Powiadomienia w aplikacji (APP/SMS) i zadania okresowe czekają w kolejkach. | `docker compose up -d celery-worker`. |
| `celery-beat` zatrzymany | Brak przypomnień o płatnościach i cyklicznego `retry_failed_notifications`. | `docker compose up -d celery-beat`. |
| Mailpit / SMTP niedostępny | `send_email` ponawia 6 razy, potem zapis `FAILED`. | Uruchomić SMTP; nieudane e-maile nie są wysyłane ponownie (luka 2). |
| Różne wartości `INTERNAL_API_KEY` w usługach | Oba endpointy wewnętrzne zwracają 401: QR nie są unieważniane, e-maile kończą się `FAILED`; w logach `rejected internal request`. | Ustawić jedną wartość w `.env` i zrestartować core-api, service-api i workery. |
| Różne `JWT_SECRET` | service-api odrzuca wszystkie tokeny (401). | Jedna wartość w `.env`, restart usług. |

**Znane luki** (świadomie nienaprawione, opisane do dalszej pracy):

1. **Utracone zdarzenie „użytkownik usunięty” zostawia aktywne kody QR.** Jeżeli service-api nie odpowie w ciągu 2 ponowień (limit 5 s), core-api tylko loguje ostrzeżenie `Integration: failed to notify service-api about deleted user {UserId}`. Zdarzenie nie jest nigdzie zapisywane ani ponawiane później, więc kody QR usuniętego użytkownika pozostają w stanie `ACTIVE` i mogą zostać użyte. Obejście: po przywróceniu service-api wywołać ręcznie `POST /api/service/internal/users/{id}/deleted` z kluczem dla id z logów. Docelowo: wzorzec outbox w core-api albo publikacja zdarzenia przez RabbitMQ.
2. **`notification_retry_task` niczego nie wysyła ponownie.** Zadanie zmienia status `FAILED` → `PENDING` i zwiększa `retry_count`, ale żaden worker nie przetwarza powiadomień w stanie `PENDING`, więc e-mail nie zostaje wysłany drugi raz. Docelowo zadanie powinno ponownie wywołać `send_email` dla takich rekordów.

---

## 10. Uruchomienie i testowanie

### Uruchomienie

```bash
cp .env.example .env          # uzupełnij JWT_SECRET (min. 32 bajty) i INTERNAL_API_KEY
docker compose up -d --build
docker compose ps             # migrate kończy się statusem Exited (0), reszta Up
```

| Adres | Co |
|-------|----|
| `http://localhost` | aplikacja (przez nginx) |
| `http://localhost:3001` | core-api bezpośrednio (Swagger w trybie Development) |
| `http://localhost:3002/docs` | service-api bezpośrednio (Swagger) |
| `http://localhost:8025` | Mailpit — wysłane e-maile |
| `http://localhost:15673` | RabbitMQ — kolejki |

Konta z danymi startowymi (tworzone przez core-api w trybie Development): `admin@akademik.com` / `admin123` (administrator), `i.kublytskyi@student.com` / `student123` (mieszkaniec).

### Testy automatyczne

**service-api (pytest, 47 testów).** Testy wykonują `TRUNCATE` tabel `notifications`, `issues`, `complaints`, `events`, `qr_codes` w bazie z `DATABASE_URL`. **Nie uruchamiaj ich na bazie z danymi** — użyj osobnej bazy testowej:

```bash
docker compose exec postgres createdb -U akademik akademik_test

cd apps/service-api
poetry install
DATABASE_URL=postgresql+asyncpg://akademik:secret@localhost:5432/akademik_test poetry run pytest -q
```

**core-api (xUnit, 9 testów).** Nie wymagają bazy ani działających kontenerów (baza w pamięci, atrapa klienta service-api):

```bash
cd apps/core-api/src
dotnet test Akademik.IntegrationTests/Akademik.IntegrationTests.csproj
```

Oba zestawy uruchamia też CI (`.github/workflows/service-api.yml`, `.github/workflows/core-api.yml`).

### Testy manualne integracji

Scenariusze krok po kroku (import, routing, buforowanie, ponawianie, klucz 401/204, unieważnianie QR, skrzynka administratora) znajdują się w [`docs/tests/scenarios.md`](tests/scenarios.md), w części **INT-TC**.

Szybki test klucza wewnętrznego:

```bash
KEY=$(grep '^INTERNAL_API_KEY=' .env | cut -d= -f2)

curl -i -X POST http://localhost/api/service/internal/users/999/deleted            # 401
curl -i -X POST http://localhost/api/service/internal/users/999/deleted -H "X-Api-Key: $KEY"   # 204
curl -i http://localhost/api/core/internal/users/2 -H "X-Api-Key: $KEY"            # 200 + e-mail (id 2 = mieszkaniec z seeda)
```
