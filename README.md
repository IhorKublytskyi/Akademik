# Akademik

A dormitory management platform that helps residents report issues, submit complaints, receive notifications, and manage QR-based access — all in one place.

## Architecture

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

| Service | Responsibility |
|---|---|
| **core-api** (C#) | Auth, user management, issues JWT tokens |
| **service-api** (Python) | Issues, complaints, notifications, QR codes, events |
| **web** (Next.js) | Student-facing UI |
| **nginx** | Reverse proxy — routes `/api/core/` and `/api/service/` |

## Tech Stack

- **core-api** — ASP.NET Core, C#
- **service-api** — FastAPI, SQLAlchemy (async), Alembic, asyncpg, PyJWT
- **web** — Next.js 16, React 19, Tailwind CSS, shadcn/ui, Zustand, TanStack Query
- **Infra** — PostgreSQL 16, RabbitMQ 3, Nginx, Docker Compose

## Domain Models FastAPI

| Model | Description |
|---|---|
| `Issue` | Maintenance request from a resident (priority + status lifecycle) |
| `Complaint` | Feedback or complaint, optionally anonymous |
| `Notification` | Outbound messages via EMAIL / SMS / APP |
| `QRCode` | Time-limited access token for building or room entry |
| `Event` | Scheduled event (room inspection, payment deadline, etc.) |

## JWT Flow

```
core-api  ──issues──▶  JWT (HS256, shared secret)
                              │
service-api  ◀──validates─────┘  (never issues)
```

`service-api` only validates tokens signed by `core-api`. The shared secret is set via `JWT_SECRET` env variable.

## Getting Started

```bash
cp .env.example .env   # set JWT_SECRET and DB credentials
docker compose up -d
```

Migrations (run inside the `service-api` container):

```bash
cd apps/service-api
alembic upgrade head
```

## Project Structure

```
apps/
  core-api/       # C# — auth & user management
  service-api/    # Python — domain services
    alembic/      # database migrations
    src/
      domain/
      application/
      infrastructure/
        auth/         # JWT validation
        database/     # async SQLAlchemy + models
      presentation/
        api/v1/       # HTTP endpoints
  web/            # Next.js frontend
nginx/            # reverse proxy config
docker-compose.yml
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `GET` | `/v1/me` | Bearer JWT | Current user identity |
