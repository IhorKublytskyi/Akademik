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
---

# core-api

A dormitory management platform designed to automate resident life, from secure access to issue reporting.

## Project Progress: Week 1 (Current State)

We have established the foundational **Core API** (ASP.NET Core 10) including the database schema for users and a robust authentication system with token rotation.

## 1. Architecture Overview
The backend is organized into specialized modules to ensure a clean separation of concerns:

| Layer | Project Type | Responsibility |
| :--- | :--- | :--- |
| **Akademik** | Executable (API) | Program entry point, Middleware, Controllers/Endpoints |
| **Akademik.Services** | Class Library | Business logic: JWT Generation, User Registration, Password Hashing |
| **Akademik.DataProvider** | Class Library | Database context, Entity configurations, Migrations, Models |
## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `GET` | `/v1/me` | Bearer JWT | Current user identity |
---

## Implemented Domain Models (`core-api`)
The **User** entity is fully configured using EF Core Fluent API with the following database-level optimizations:

* **User Schema**: Fields include `FirstName`, `LastName`, `Email` (Unique), `PasswordHash`, `Role` (Admin/Resident), and `Status` (Active/Blocked).
* **Database Indexes**:
    * `Index_Email_Unique`: Enforces email uniqueness at the DB level.
    * `Index_Fullname`: Composite index on `LastName` + `FirstName` for optimized searching.
    * `Index_ActiveOnly`: A filtered index for faster lookups during the login process.
* **RefreshTokens**: Dedicated storage for long-lived session management and secure token rotation.

## Authentication & Security
We have implemented a secure authentication flow based on the project's security requirements:

* **Password Hashing**: Powered by `BCrypt.Net` to ensure one-way cryptographic protection of user credentials.
* **JWT Access Tokens**: Short-lived tokens containing claims: `sub` (ID), `email`, `role`, and `status`.
* **Token Rotation**: Use of Refresh Tokens to allow users to stay logged in securely without re-entering passwords, with the ability to revoke sessions instantly.

## API Endpoints (Core API)

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/core/auth/login` | Public | Validates credentials; returns Access & Refresh tokens. |
| `POST` | `/api/core/auth/register` | Admin | Registers new residents. Restricted to Administrator role. |
| `POST` | `/api/core/auth/refresh` | Public | Exchanges a valid Refresh Token for a new pair of tokens. |

## Getting started
- Apply migration 
```bash
dotnet ef migration database update --project ./Akademik.DataProvider --startup-project Akademik
```
- Run executable
```bash
dotnet run --project ./Akademik
```

