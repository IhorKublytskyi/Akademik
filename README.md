# Akademik

Platforma do zarządzania akademikiem — zgłaszanie usterek, składanie skarg, powiadomienia i dostęp przez kody QR w jednym miejscu.

## Opis projektu

Aplikacja umożliwia mieszkańcom akademika zgłaszanie problemów technicznych, składanie skarg oraz otrzymywanie powiadomień (e-mail, SMS, push). System obsługuje również QR-owy dostęp do budynku i pomieszczeń oraz zarządzanie wydarzeniami (inspekcje, terminy płatności).

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
- [ ] Implement Issues API
- [ ] Implement Events API
- [ ] Implement Complaints API

**Milestone 3 — Integration**
- [ ] Prepare notification service and email integration
- [ ] Prepare scheduled tasks structure and service interaction
- [ ] Global UI and auth flow
- [ ] Integration of backend with frontend

**Milestone 4 — MVP / Demo**
- [ ] Testing
- [ ] Bug fixing
- [ ] Final integration
- [ ] Deployment readiness

## Autorzy

- *(uzupełnić — imię nazwisko – rola)*
- *(uzupełnić — imię nazwisko – rola)*
- *(uzupełnić — imię nazwisko – rola)*

## Technologie

**Frontend:**
- Next.js 16, React 19
- Tailwind CSS, shadcn/ui
- Zustand, TanStack Query

**Backend:**
- ASP.NET Core 10 (C#) — core-api
- FastAPI, SQLAlchemy (async), Alembic — service-api

**Baza danych:**
- PostgreSQL 16

**Infrastruktura:**
- RabbitMQ 3
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
- [ ] Panel statystyk dla administratora
- [ ] Historia zdarzeń / audit log

## Architektura projektu

```
┌─────────┐     ┌────────────┐     ┌─────────────┐
│  web    │     │  core-api  │     │ service-api │
│ Next.js │     │  ASP.NET   │     │   FastAPI   │
│  :80    │     │   :3001    │     │    :3002    │
└────┬────┘     └─────┬──────┘     └──────┬──────┘
     │                │                   │
     └────────────────┴───────────────────┘
                       │
                    nginx :80
                       │
              ┌────────┴────────┐
              │                 │
          postgres          rabbitmq
```

| Serwis | Odpowiedzialność |
|--------|-----------------|
| **core-api** (C#) | Auth, zarządzanie użytkownikami, wydawanie JWT |
| **service-api** (Python) | Usterki, skargi, powiadomienia, QR, eventy |
| **web** (Next.js) | Interfejs dla mieszkańców |
| **nginx** | Reverse proxy — `/api/core/` i `/api/service/` |

JWT wystawiany przez `core-api`, walidowany przez `service-api` (wspólny sekret `JWT_SECRET`).

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

Uzupełnij `.env`: `JWT_SECRET`, dane dostępowe do bazy danych.

## Uruchomienie aplikacji

### Docker (zalecane)

```bash
docker compose up -d
```

### Migracje bazy danych

```bash
docker exec -it service-api bash
cd apps/service-api
alembic upgrade head
```

### core-api (lokalnie)

```bash
dotnet ef database update --project ./Akademik.DataProvider --startup-project Akademik
dotnet run --project ./Akademik
```

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
  core-api/         — C#, auth i zarządzanie użytkownikami
    Akademik/
    Akademik.Services/
    Akademik.DataProvider/
  service-api/      — Python, serwisy domenowe
    alembic/        — migracje bazy danych
    src/
      domain/
      application/
      infrastructure/
        auth/       — walidacja JWT
        database/   — SQLAlchemy + modele
      presentation/
        api/v1/     — endpointy HTTP
  web/              — frontend Next.js
nginx/              — konfiguracja reverse proxy
docker-compose.yml
.env.example
```

## API

### core-api

| Metoda | Ścieżka | Auth | Opis |
|--------|---------|------|------|
| `POST` | `/api/core/auth/login` | Publiczny | Logowanie; zwraca Access + Refresh token |
| `POST` | `/api/core/auth/register` | Admin | Rejestracja nowego mieszkańca |
| `POST` | `/api/core/auth/refresh` | Publiczny | Wymiana Refresh Token na nową parę tokenów |

### service-api

| Metoda | Ścieżka | Auth | Opis |
|--------|---------|------|------|
| `GET/POST` | `/api/service/issues` | JWT | Lista / tworzenie usterek |
| `GET/POST` | `/api/service/complaints` | JWT | Lista / tworzenie skarg |
| `GET` | `/api/service/notifications` | JWT | Powiadomienia użytkownika |
| `GET/POST` | `/api/service/qrcodes` | JWT | Generowanie i weryfikacja kodów QR |
| `GET/POST` | `/api/service/events` | JWT | Eventy akademika |

## Zrzuty ekranu

*(dodać po ukończeniu UI)*

```
![login](docs/screenshots/login.png)
![dashboard](docs/screenshots/dashboard.png)
```

## Status projektu

Projekt w trakcie rozwoju — realizowany w ramach kursu Projekt Zespołowy Systemów Informatycznych 2026.

## Licencja

Projekt edukacyjny.
