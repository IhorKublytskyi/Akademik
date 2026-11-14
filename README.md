# Akademik

Platforma do zarządzania akademikiem — zgłaszanie usterek, składanie skarg, powiadomienia i dostęp przez kody QR w jednym miejscu.

## Opis projektu

Aplikacja umożliwia mieszkańcom akademika zgłaszanie problemów technicznych, składanie skarg oraz otrzymywanie powiadomień (e-mail, SMS, w aplikacji). System obsługuje również QR-owy dostęp do budynku i pomieszczeń oraz zarządzanie wydarzeniami (inspekcje, terminy płatności).

Posiada panel administracyjny do zarządzania użytkownikami, zgłoszeniami i dostępem.

## Sprint Plan

**Milestone 1 — Foundation**
- [x] Set up FastAPI project and base architecture
- [x] Configure DbContext / entities / configurations
- [x] Frontend setup and infrastructure
- [x] Set up Alembic
- [x] Configure JWT validator
- [x] Configure dependencies / DI
- [x] Implement /me router

**Milestone 2 — Core API**
- [x] Implement Issues API
- [x] Implement Events API
- [x] Implement Complaints API

**Milestone 3 — Integration**
- [x] Prepare notification service and email integration
- [x] Prepare scheduled tasks structure and service interaction
- [x] Global UI and auth flow
- [x] Integration of backend with frontend

**Milestone 4 — MVP / Demo**
- [x] Testing (testy automatyczne: 47 w Pythonie — service-api, 9 w C# — core-api)
- [x] Bug fixing
- [x] Final integration
- [x] Deployment readiness (Docker multistage builds, CI/CD)

## Autorzy

- Katsiaryna Kozhych - service-api
- Ihor Kublytskyi - core-api
- Anton Hryshchuk - web

## Technologie

**Frontend:**
- Next.js 16, React 19
- Tailwind CSS, shadcn/ui
- Zustand, TanStack Query

**Backend:**
- ASP.NET Core 9 (C#, `net9.0`), Entity Framework Core — core-api
- Python 3.12, FastAPI, SQLAlchemy (async), Alembic — service-api
- Celery 5 (workery i harmonogram Celery Beat) — zadania asynchroniczne i okresowe

**Baza danych:**
- PostgreSQL 16

**Infrastruktura:**
- RabbitMQ 3 (broker Celery)
- Mailpit (testowy serwer SMTP)
- Nginx (reverse proxy)
- Docker Compose

## Funkcjonalności

- [x] Rejestracja i logowanie mieszkańców (JWT + Refresh Token)
- [x] Zarządzanie użytkownikami przez administratora
- [x] Zgłaszanie usterek (priorytety, statusy)
- [x] Składanie skarg (opcjonalnie anonimowo)
- [x] Powiadomienia (EMAIL / SMS / APP)
- [x] Kody QR z limitem czasowym (dostęp do budynku/pokoi)
- [x] Zarządzanie wydarzeniami (inspekcje, terminy)
- [x] Import wydarzeń z pliku CSV
- [x] Integracja usług: unieważnianie kodów QR po usunięciu użytkownika, e-mail po zamknięciu usterki
- [ ] Panel statystyk dla administratora
- [ ] Historia zdarzeń / audit log

## Architektura projektu

```
                           przeglądarka
                                │
                           nginx :80
          ┌─────────────────────┼──────────────────────┐
          │ /                   │ /api/core/           │ /api/service/
   ┌──────┴──────┐       ┌──────┴──────┐  X-Api-Key  ┌──┴──────────┐
   │    web      │       │  core-api   │────────────▶│ service-api │
   │  Next.js    │       │ ASP.NET 9   │◀──────┐     │   FastAPI   │
   │   :3000     │       │ :3001→8080  │       │     │    :3002    │
   └─────────────┘       └──────┬──────┘       │     └──┬───────┬──┘
                                │              │        │ Celery│
                                │     X-Api-Key│        ▼       │
                                │   (lookup    │  ┌──────────┐  │
                                │    e-mail)   │  │ RabbitMQ │  │
                                │              │  └─┬──────┬─┘  │
                                │              │    ▼      ▼    │
                                │   ┌──────────┴───────┐ ┌─────────────┐
                                │   │celery-worker-email│ │celery-worker│◀── celery-beat
                                │   └────────┬─────────┘ └──────┬──────┘
                                │            │ SMTP             │
                                │      ┌─────┴─────┐            │
                                │      │  Mailpit  │            │
                                │      │   :8025   │            │
                                │      └───────────┘            │
                                ▼                               ▼
                         ┌───────────────────────────────────────────┐
                         │               PostgreSQL 16               │
                         └───────────────────────────────────────────┘
```

Pełny diagram (Mermaid), diagramy sekwencji i opis awarii: [docs/integration.md](docs/integration.md).

| Serwis | Odpowiedzialność |
|--------|-----------------|
| **core-api** (C#) | Auth, zarządzanie użytkownikami, pokoje, przydziały, wydawanie JWT |
| **service-api** (Python) | Usterki, skargi, powiadomienia, QR, eventy |
| **celery-worker** | Kolejki `celery`, `notifications.app`, `notifications.sms` — powiadomienia w aplikacji i zadania okresowe |
| **celery-worker-email** | Kolejka `notifications.email` — pobiera adres z core-api i wysyła e-mail przez SMTP |
| **celery-beat** | Harmonogram: przypomnienia o płatnościach (codziennie 08:00 UTC), ponawianie powiadomień (co 30 min) |
| **mailpit** | Testowy serwer SMTP (`:1025`) ze skrzynką podglądową `http://localhost:8025` |
| **rabbitmq** | Broker wiadomości; panel `http://localhost:15673` |
| **web** (Next.js) | Interfejs dla mieszkańców i administratora |
| **nginx** | Reverse proxy — `/api/core/` i `/api/service/` |

JWT wystawiany przez `core-api`, walidowany przez `service-api` (wspólny sekret `JWT_SECRET`).

### Kolejki i przepływ e-maili

Powiadomienia z service-api trafiają do RabbitMQ, do kolejki zależnej od kanału:

| Kolejka | Zawartość | Worker |
|---------|-----------|--------|
| `celery` | zadania okresowe z Celery Beat | `celery-worker` |
| `notifications.app` | powiadomienia w aplikacji | `celery-worker` |
| `notifications.sms` | powiadomienia SMS (zapisywane w bazie) | `celery-worker` |
| `notifications.email` | e-maile | `celery-worker-email` |

Przepływ e-maila: usterka zamknięta (`PATCH .../issues/{id}/status` → `CLOSED`) → zadanie `send_email` w kolejce `notifications.email` → worker pobiera adres z `GET /api/core/internal/users/{id}` → wysyła wiadomość przez SMTP (Mailpit) → zapisuje powiadomienie `SENT`. Przy błędzie ponawia do 6 prób (odstęp 1, 2, 4, 8, 16 s), potem zapisuje `FAILED`.

### Powiadomienia administratora

Każda nowa skarga tworzy powiadomienie w skrzynce administratorów (`user_id = 0`). Przy skardze anonimowej powiadomienie celowo **nie zawiera autora** (`Complaint #N was filed anonymously.`); przy zwykłej zawiera id autora, a autor dostaje dodatkowo potwierdzenie. Administrator widzi wszystkie powiadomienia, mieszkaniec — tylko swoje.

## Instalacja

1. Sklonuj repozytorium:

```bash
git clone https://github.com/nazwa/akademik.git
cd akademik
```

2. Skonfiguruj zmienne środowiskowe:

```bash
cp .env.example .env
```

Uzupełnij `.env` (opis zmiennych poniżej). Obowiązkowo zmień `JWT_SECRET` i `INTERNAL_API_KEY`.

### Zmienne środowiskowe

| Zmienna | Używa | Opis |
|---------|-------|------|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | postgres, core-api, service-api, workery | Dane bazy; jedna baza dla obu usług |
| `RABBITMQ_USER`, `RABBITMQ_PASS` | rabbitmq, service-api, workery | Dane logowania do brokera i panelu RabbitMQ |
| `JWT_SECRET` | core-api (`Jwt__Key`), service-api | Wspólny sekret podpisu JWT, **min. 32 bajty** (core-api nie wystartuje z krótszym). Wygeneruj: `openssl rand -base64 48` |
| `INTERNAL_API_KEY` | core-api (`Integration__ApiKey`), service-api, workery | Klucz `X-Api-Key` dla endpointów wewnętrznych. **Musi być taki sam w obu usługach** — inaczej endpointy wewnętrzne zwracają 401, kody QR nie są unieważniane, a e-maile kończą się błędem |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` | service-api, celery-worker-email | Serwer SMTP i nadawca; domyślnie Mailpit: `mailpit`, `1025`, `noreply@akademik.local` |

## Uruchomienie aplikacji

### Docker (zalecane)

```bash
docker compose up -d --build
```

Migracje service-api (Alembic) wykonuje automatycznie kontener `migrate` przed startem service-api; core-api stosuje migracje EF Core przy starcie.

| Adres | Co |
|-------|----|
| `http://localhost` | aplikacja |
| `http://localhost:8025` | Mailpit — wysłane e-maile |
| `http://localhost:15673` | panel RabbitMQ |
| `http://localhost:3001` | core-api (Swagger w trybie Development) |
| `http://localhost:3002/docs` | service-api (Swagger) |

### Konta testowe

W trybie Development core-api tworzy przy starcie dwa konta:

| Rola | Login | Hasło |
|------|-------|-------|
| Administrator | `admin@akademik.com` | `admin123` |
| Mieszkaniec | `i.kublytskyi@student.com` | `student123` |

### Migracje ręcznie (opcjonalnie)

```bash
docker compose run --rm migrate
```

### core-api (lokalnie)

Sekrety nie są przechowywane w `appsettings.json`. Przy uruchomieniu bez Dockera ustaw je przez `dotnet user-secrets` (z katalogu `apps/core-api/src`):

```bash
dotnet user-secrets set "Jwt:Key" "<ta sama wartość co JWT_SECRET w .env>" --project ./Akademik
dotnet user-secrets set "ConnectionStrings:AkademikConnectionString" "Host=localhost;Port=5432;Database=Akademik;Username=postgres;Password=<hasło>" --project ./Akademik
dotnet user-secrets set "Integration:ApiKey" "<INTERNAL_API_KEY z .env>" --project ./Akademik
```

W Dockerze wartości pochodzą z `.env` (`JWT_SECRET`, `POSTGRES_*`, `INTERNAL_API_KEY`).

`dotnet ef database update` nie czyta user-secrets — connection string podaj przez zmienną środowiskową:

```bash
export ConnectionStrings__AkademikConnectionString="Host=localhost;Port=5432;Database=Akademik;Username=postgres;Password=<hasło>"
dotnet ef database update --project ./Akademik.DataProvider --startup-project Akademik
dotnet run --project ./Akademik
```

## Import wydarzeń z CSV

Skrypt `apps/service-api/scripts/import_events.py` importuje wydarzenia (inspekcje, płatności, inne) do tabeli `events`:

```bash
docker compose exec service-api python -m scripts.import_events scripts/sample_events.csv
```

Plik CSV (UTF-8) musi mieć nagłówek z kolumnami:

| Kolumna | Format |
|---------|--------|
| `user_id` | liczba całkowita (id użytkownika z core-api) |
| `title` | tekst |
| `description` | tekst, może być pusty |
| `start_at`, `end_at` | data ISO 8601, np. `2026-12-01T09:00:00` |
| `type` | `ROOM_INSPECTION`, `PAYMENT` lub `OTHER` |

Wynik: `imported: N` i `failed: M` na standardowym wyjściu; każdy błędny wiersz jest pomijany i opisany na stderr (`row 3: ...`). **Kod wyjścia `1`**, jeśli choć jeden wiersz się nie powiódł (lub brak argumentu), w przeciwnym razie `0`. Przykładowy plik: `apps/service-api/scripts/sample_events.csv`.

## Integracja i logi

Usługi logują zdarzenia integracyjne na stdout: core-api z prefiksem `Integration:`, service-api i workery przez logger `integration` (m.in. `notify: routing channel=... to queue=...`, `user_deleted: revoked N active QR codes`, `send_email: attempt N failed`, `send_email: giving up`, `send_email: delivered`).

```bash
docker compose logs -f core-api service-api celery-worker celery-worker-email
docker compose logs core-api | grep "Integration:"
docker compose logs celery-worker-email | grep send_email
```

Pełna lista zdarzeń: [docs/integration.md, rozdz. 7](docs/integration.md#7-zdarzenia-integracyjne-i-logowanie).

## Integracja (5.0)

Dokumentacja techniczna integracji: **[docs/integration.md](docs/integration.md)**. Zawiera:

- diagram architektury (Mermaid),
- diagramy sekwencji: usunięcie użytkownika → unieważnienie kodów QR; zamknięcie usterki → kolejka → worker e-mail → core-api → SMTP,
- kolejki, routing, buforowanie i ponawianie,
- tabelę mapowania wymagań na pliki,
- tabelę awarii (skutek i przywrócenie), w tym pojedyncze punkty awarii (RabbitMQ, PostgreSQL) i znane luki,
- polecenia do uruchomienia i testowania.

Scenariusze testów manualnych integracji: [docs/tests/scenarios.md](docs/tests/scenarios.md) (część INT-TC).

## Testy

### service-api (pytest — 47 testów)

> **Uwaga:** testy wykonują `TRUNCATE` tabel service-api w bazie wskazanej przez `DATABASE_URL`. Uruchamiaj je wyłącznie na **osobnej bazie testowej**, nigdy na bazie z danymi.

```bash
docker compose exec postgres createdb -U akademik akademik_test

cd apps/service-api
poetry install
DATABASE_URL=postgresql+asyncpg://akademik:secret@localhost:5432/akademik_test poetry run pytest -q
```

### core-api (xUnit — 9 testów)

Baza w pamięci, nie wymaga uruchomionych kontenerów:

```bash
cd apps/core-api/src
dotnet test Akademik.IntegrationTests/Akademik.IntegrationTests.csproj
```

Oba zestawy uruchamia też CI (GitHub Actions, `.github/workflows/`). Scenariusze testów manualnych: [docs/tests/scenarios.md](docs/tests/scenarios.md).

## Instrukcja użytkownika

1. Otwórz przeglądarkę i przejdź pod adres: `http://localhost`
2. Zaloguj się podanymi przez administratora danymi
3. Z panelu głównego możesz:
   - zgłosić usterkę (zakładka *Usterki*)
   - złożyć skargę (zakładka *Skargi*)
   - sprawdzić powiadomienia
   - pobrać/wygenerować kod QR do wejścia

Konto administratora umożliwia rejestrowanie nowych mieszkańców i zarządzanie zgłoszeniami.

## Struktura repozytorium

```
apps/
  core-api/                — C#, auth i zarządzanie użytkownikami
    src/
      Akademik/            — endpointy, rejestracja klienta service-api
      Akademik.Services/   — logika, klient HTTP service-api
      Akademik.DataProvider/ — EF Core, migracje, dane startowe
      Akademik.IntegrationTests/ — testy xUnit
  service-api/             — Python, serwisy domenowe
    alembic/               — migracje bazy danych
    scripts/               — import wydarzeń z CSV
    src/
      domain/
      application/
        services/          — logika, routing powiadomień
        tasks/             — zadania Celery
      infrastructure/
        auth/              — walidacja JWT
        celery/            — konfiguracja Celery i kolejek
        database/          — SQLAlchemy + modele
      presentation/
        api/v1/            — endpointy HTTP
    tests/                 — testy pytest
  web/                     — frontend Next.js
docs/
  integration.md           — dokumentacja integracji
  diagrams/                — diagram architektury (PNG)
  tests/scenarios.md       — scenariusze testów manualnych
nginx/                     — konfiguracja reverse proxy
docker-compose.yml
.env.example
```

## API

### core-api

| Metoda | Ścieżka | Auth | Opis |
|--------|---------|------|------|
| `POST` | `/api/core/auth/login` | Publiczny | Logowanie; zwraca dane użytkownika i parę tokenów |
| `POST` | `/api/core/auth/register` | Admin | Rejestracja nowego użytkownika |
| `POST` | `/api/core/auth/refresh` | JWT | Wymiana Refresh Token na nową parę tokenów |
| `GET` | `/api/core/me` | JWT | Dane zalogowanego użytkownika |
| `POST` | `/api/core/users-get` | Admin | Lista użytkowników (paginacja) |
| `GET` | `/api/core/users-get/{id}` | Admin | Użytkownik po id |
| `POST` | `/api/core/users-edit` | Admin | Edycja użytkownika |
| `DELETE` | `/api/core/users/{id}` | Admin | Usunięcie użytkownika; powiadamia service-api (unieważnienie kodów QR) |
| `POST` | `/api/core/rooms-get` | Admin | Lista pokoi |
| `POST` | `/api/core/rooms-add` | Admin | Dodanie pokoju |
| `POST` | `/api/core/rooms-edit` | Admin | Edycja pokoju |
| `POST` | `/api/core/assignments-get` | Admin | Lista przydziałów |
| `POST` | `/api/core/assignments-add` | Admin | Przydział mieszkańca do pokoju |
| `DELETE` | `/api/core/assignments/{id}` | Admin | Usunięcie przydziału |
| `GET` | `/api/core/assignments/roommates` | JWT | Współlokatorzy zalogowanego użytkownika |
| `GET` | `/api/core/internal/users/{id}` | `X-Api-Key` | **Wewnętrzny.** `{id, email, firstName, lastName}`; używany przez worker e-mail. 401 bez / ze złym kluczem, 404 dla nieznanego id |

### service-api

| Metoda | Ścieżka | Auth | Opis |
|--------|---------|------|------|
| `GET` | `/api/service/health` | Publiczny | Stan usługi |
| `GET` | `/api/service/v1/me` | JWT | Id i rola z tokenu |
| `GET/POST` | `/api/service/v1/issues` | JWT | Lista (admin — wszystkie) / zgłoszenie usterki; filtr `?issue_status=` |
| `PATCH` | `/api/service/v1/issues/{id}/status` | Admin | Zmiana statusu usterki; przy `CLOSED` wysyła e-mail |
| `GET/POST` | `/api/service/v1/complaints` | JWT | Lista / złożenie skargi; filtr `?complaint_status=` |
| `PATCH` | `/api/service/v1/complaints/{id}/status` | Admin | Zmiana statusu skargi |
| `GET/POST` | `/api/service/v1/qr-codes` | JWT | Lista kodów QR (paginacja `?page=&size=`) / wygenerowanie kodu |
| `POST` | `/api/service/v1/qr-codes/validate` | Publiczny | Weryfikacja tokenu QR (jednorazowa — kod przechodzi w `USED`) |
| `PATCH` | `/api/service/v1/qr-codes/{id}/revoke` | Admin | Unieważnienie kodu QR |
| `GET/POST` | `/api/service/v1/events` | JWT | Lista / dodanie wydarzenia osobistego |
| `PATCH/DELETE` | `/api/service/v1/events/{id}` | JWT | Edycja / usunięcie własnego wydarzenia |
| `POST` | `/api/service/v1/admin/events/room-inspections` | Admin | Masowe tworzenie inspekcji pokoi z powiadomieniami |
| `GET` | `/api/service/v1/notifications` | JWT | Powiadomienia (admin — wszystkie, w tym skrzynka administratora) |
| `POST` | `/api/service/internal/users/{id}/deleted` | `X-Api-Key` | **Wewnętrzny.** Unieważnia aktywne kody QR użytkownika; 204, 401 bez / ze złym kluczem |

Endpointy wewnętrzne wymagają nagłówka `X-Api-Key` z wartością `INTERNAL_API_KEY`.

## Zrzuty ekranu

![login](docs/screenshots/login.jpg)
![dashboard](docs/screenshots/dashboard.jpg)

## Status projektu

Projekt w trakcie rozwoju — realizowany w ramach kursu Projekt Zespołowy Systemów Informatycznych 2026.

## Licencja

Projekt edukacyjny.
