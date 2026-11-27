# OBMMS Technical Documentation

This document describes the internal architecture, design decisions, and implementation details of the **Online Bus Monitoring & Management System (OBMMS)**. It is intended for developers who need to understand, extend, or maintain the codebase — not for end users (see [README.md](README.md)) or first-time contributors (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Repository Layout](#2-repository-layout)
3. [Backend](#3-backend)
4. [Frontend](#4-frontend)
5. [Mobile](#5-mobile)
6. [Update Manager](#6-update-manager)
7. [Cross-Cutting Concerns](#7-cross-cutting-concerns)
8. [Development Environment](#8-development-environment)

## 1. System Architecture

OBMMS is a **monorepo** containing three independently deployable applications that share one backend:

| Application | Runtime | Role |
|---|---|---|
| **Backend** | Python 3.11+ / FastAPI | REST API, WebSocket streams, authentication, database access, self-update orchestration |
| **Frontend** | React 18 + Vite | Admin dashboard, map UI, self-update notifier |
| **Mobile** | React Native (Android / iOS) | Driver and passenger app, GPS location sharing, self-update installer |

The system follows a **client-server architecture**. The backend is the single source of truth — every frontend and mobile request resolves against it. In production, the built frontend is served by the backend itself (the `templates/index.html` and `static/` directories are baked into the backend Docker image), so a deployed OBMMS instance is a single process reachable on one port.

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  Browser (SPA) │    │  Mobile App    │    │  GPS Tracker   │
└────────┬───────┘    └────────┬───────┘    └────────┬───────┘
         │ REST + WS           │ REST + WS           │ WS
         └──────────────┬──────┴─────────────────────┘
                        ▼
              ┌─────────────────────┐
              │  FastAPI Backend    │
              │  (module router     │
              │   composition)      │
              └─────────┬───────────┘
                        ▼
              ┌─────────────────────┐
              │  MySQL (SQLAlchemy) │
              └─────────────────────┘
```

## 2. Repository Layout

### 2.1 Top Level

```
OBMMS/
├── .github/                    GitHub Actions workflows (release publishing)
├── .vscode/                    Shared VS Code settings and extension recommendations
├── backend/                    FastAPI backend (REST + WebSocket + self-updater)
├── docs/                       Additional documentation and diagrams
├── frontend/                   React 18 + Vite admin SPA
├── mobile/                     React Native app (Android + iOS)
├── .gitignore
├── docker-compose.yaml         Production stack (backend + frontend builder)
├── LICENSE.md                  MIT License
├── README.md                   Project overview and setup guide
└── TECHNICAL.md                This document
```

### 2.2 Backend (`backend/`)

```
backend/
├── accounts/                   Packages and fee management module
│   ├── __init__.py             Registers router on the FastAPI app
│   ├── helper.py               Payment helpers, package validation
│   ├── models.py               Package, Payment, Due models
│   └── routes.py               /api/accounts/* endpoints
├── admin/                      Administrative CRUD module
│   ├── __init__.py
│   ├── helper.py               Permission checks, group lookups
│   ├── models.py               CRUD models mirroring the schema
│   └── routes.py               /api/admin/* endpoints
├── auth/                       Authentication and authorization module
│   ├── __init__.py
│   ├── helper.py               JWT encode/decode, password hashing
│   ├── models.py               User session models
│   └── routes.py               /api/auth/* endpoints
├── obmms/                      Core package (app init, DB, settings, base routes)
│   ├── __init__.py             OBMMS class — composes all modules
│   ├── database.py             SQLAlchemy engine, SessionLocal, Base
│   ├── models.py               Shared models and relationships
│   ├── routes.py               Core routes (health, root)
│   └── settings.py             Single source of truth for env config
├── tracking/                   GPS tracking and bus management module
│   ├── __init__.py
│   ├── helper.py               WebSocket helpers, location validation
│   ├── models.py               Bus, Route, Stop, Location models
│   └── routes.py               /api/tracking/* endpoints
├── updater/                    Self-update manager
│   ├── __init__.py             Updater class + get_updater() singleton
│   ├── helper.py               Pure functions: version parsing, GitHub API, zips
│   └── routes.py               /api/system/* update endpoints
├── .dockerignore
├── Dockerfile                  Backend image (imports frontend artifacts)
├── main.py                     Entry point: OBMMS class + CLI commands
├── README.md                   Backend setup guide
└── requirements.txt
```

> The `helper.py` / `models.py` / `routes.py` split inside each module is the convention for this codebase. `routes.py` is HTTP glue; `helper.py` is business logic and pure functions; `models.py` is SQLAlchemy models. Adding a new module means creating these four files (including `__init__.py`) and registering the class in `OBMMS.__init__`.

### 2.3 Frontend (`frontend/`)

```
frontend/
├── public/                     Static assets copied verbatim into dist/
├── src/
│   ├── assets/                 Images, icons, fonts imported by components
│   ├── components/             Reusable UI components (UpdateNotifier, map widgets)
│   ├── context/                Global React context providers (auth, alerts, theme)
│   ├── pages/                  Route-level screens (Dashboard, Users, Map, Login)
│   ├── utils/                  Non-React helpers (updateManager.js, request wrapper)
│   ├── App.jsx                 Route composition and provider tree
│   ├── config.js               Runtime config: backend URL, version, GitHub repo
│   └── main.jsx                React root
├── .dockerignore
├── Dockerfile                  Multi-stage: node build → alpine arrange
├── eslint.config.js
├── index.html                  Vite entry HTML
├── package-lock.json
├── package.json                Includes "version" (source of truth for self-updater)
├── README.md                   Frontend setup guide
└── vite.config.js
```

### 2.4 Mobile (`mobile/`)

```
mobile/
├── obmms/
│   ├── .bundle/                Bundler configuration
│   ├── android/                Native Android project (Kotlin)
│   │   └── app/
│   │       └── src/
│   │           └── main/
│   │               ├── AndroidManifest.xml
│   │               ├── java/dev/moeezraza/obmms/
│   │               │   └── AppUpdateModule.kt    Native APK installer
│   │               └── res/xml/file_paths.xml    FileProvider scoping
│   ├── ios/                    Native iOS project
│   ├── src/
│   │   ├── assets/             Images and fonts
│   │   ├── components/         Shared UI (map overlays, form rows)
│   │   ├── context/            Auth and vehicle state providers
│   │   ├── pages/              Tab screens (Map, Dues, Schedule, Login)
│   │   ├── utils/
│   │   │   ├── config.ts       Backend URL, version, GitHub repo
│   │   │   └── updateManager.ts  Version check, prompt, APK download
│   │   └── ...
│   ├── .watchmanconfig
│   ├── App.tsx                 Root component; triggers checkMobileUpdate()
│   ├── babel.config.js
│   ├── index.js                React Native entry
│   ├── jest.config.js
│   ├── metro.config.js
│   ├── package-lock.json
│   ├── package.json            "version" is compared against mobile-v* tags
│   └── tsconfig.json
└── README.md                   Mobile setup guide
```

### 2.5 `.github/`

```
.github/
├── workflows/
│   └── release.yml             Tag-triggered: builds and publishes release assets
└── ...
```

`release.yml` reacts to three tag prefixes: `backend-v*` (zips `backend/`), `frontend-v*` (zips `dist/`), `mobile-v*` (builds APK). Asset names must be `backend.zip`, `dist.zip`, and `obmms.apk` respectively — the updaters expect exactly these names.

---

## 3. Backend

### 3.1 Module Pattern

The backend is composed of **feature modules**, each self-contained and following an identical structure. Every module exposes a single class whose constructor registers its router on the shared `FastAPI` instance:

```python
# module/__init__.py
from fastapi import FastAPI

from .routes import router


class Module:
  def __init__(self, app: FastAPI) -> None:
    app.include_router(router)
```

The `OBMMS` class in `main.py` composes them:

```python
class OBMMS:
  def __init__(self) -> None:
    self.app = FastAPI()
    self.app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, ...)
    self.app.add_middleware(CORSMiddleware, ...)
    Auth(self.app)
    Admin(self.app)
    Tracking(self.app)
    Accounts(self.app)
    Updater(self.app)
    self.app.include_router(router)       # core obmms routes
    self.app.mount("/", StaticFiles(directory="static"), name="static")
```

The pattern gives each module a clean boundary: routes are owned by the module, dependencies flow through the shared app, and adding a new module means creating a folder with `__init__.py`, `routes.py`, `models.py`, `helper.py` and registering the class in `OBMMS.__init__`.

### 3.2 Core Modules

#### `auth/` — Authentication & Authorization

Handles login, logout, session creation, JWT issuance, and role/permission checks.

- Sessions are stored via Starlette's `SessionMiddleware` (signed cookies).
- JWTs are issued on login and validated per-request by a dependency.
- Passwords are hashed via `passlib` with the `bcrypt` scheme.
- Group-based permission checks gate routes under `/api/admin/*` and `/api/tracking/*`.

#### `admin/` — Administrative CRUD

Provides create/read/update/delete operations for every model: `Users`, `Group`, `Buses`, `Stops`, `Routes`, `Packages`, `History`, `Location`. Every model's permissions are governed by the user's group (see *Usage → Admin Site* in the main README for the three-level model: Not Allowed / Read Only / Read & Write).

`History` and `Location` have restrictions: `History` is write-and-delete only, and `Location` write is limited to trackers and users with explicit write permission.

#### `tracking/` — GPS & Bus Tracking

Owns WebSocket handlers for real-time location streaming (via `mr-wshandler`) and REST endpoints for bus/route/stop management. Vehicles publish location updates; the backend fans them out to subscribed clients (admins and package-holding riders).

#### `accounts/` — Packages & Fee Management

Manages transportation packages (paid services that grant location access), payment records, and dues. A user with an active package can view vehicle locations even if their group role otherwise restricts them — a deliberate separation between *permission* (role) and *entitlement* (package).

#### `obmms/` — Core

`settings.py` loads `.env` via `python-dotenv` and exposes typed config constants. `database.py` builds the SQLAlchemy engine, `SessionLocal`, and `Base`. `models.py` defines shared model classes and relationships. `routes.py` holds core (non-module) routes such as health checks.

#### `updater/` — Self-Update Manager

See [Section 6](#6-update-manager) for the full design.

### 3.3 Configuration

All runtime configuration flows through `obmms/settings.py`, which is the single source of truth for environment variables. Key rules:

- `load_dotenv()` runs **at import time** — before any `os.getenv` call in the codebase. Modules that read config must import from `settings`, never call `os.getenv` directly.
- Every env var has a sane default except `SECRET_KEY`, `JWT_ALGORITHM`, and `DB_PASSWORD`.
- `VERSION` is hardcoded in `settings.py` (not `.env`) so the self-updater can rewrite it on each release.
- The full list of env vars with required/optional status is documented in [README → Setup Guide](README.md#setup-guide).

### 3.4 Database Layer

- **Engine**: SQLAlchemy 2.0 with `pymysql` as the DBAPI driver.
- **Models**: A single declarative `Base` is shared across modules. Table names are `PascalCase` (`Users`, `Buses`, `Packages`, `History`, `Location`), column names are `snake_case` (`reset_required`, `created_at`).
- **Sessions**: `get_session()` returns a scoped session for request handlers. Background tasks (e.g., the update loop) create their own sessions and close them explicitly.
- **Table creation**: `python main.py create_tables` calls `Base.metadata.create_all(ENGINE)`. This project does **not** use Alembic — schema changes are applied manually or via the model definitions on first boot. (If you introduce migrations, add Alembic and update this section.)

## 4. Frontend

A single-page React 18 application built with Vite.

### 4.1 Structure

- `pages/` — route-level screens (Dashboard, Users, Groups, Map, Packages, Login, etc.).
- `components/` — reusable UI pieces (`UpdateNotifier`, map widgets, form controls).
- `context/` — global providers (auth context, theme, alert bus).
- `utils/` — non-React helpers (`updateManager.js`, request wrappers).
- `config.js` — runtime config module: `backend`, `frontend`, `api_prefix`, `static_dir`, `debug`, `version`, `github_repo`. Every value is read from `import.meta.env.VITE_*` with a fallback, except `version` which is `package.json.version`.

### 4.2 Configuration and Build Modes

The frontend supports two modes, differentiated by how `backend` is resolved:

| Mode | `VITE_BACKEND` | Behaviour |
|---|---|---|
| **Dev** (`npm run dev`) | `http://localhost:8000` | Vite serves SPA on `:3000`, backend on `:8000`, CORS enabled on backend |
| **Dist** (`npm run build` + served by backend) | *(empty)* | `backend === ""` → all requests are same-origin; the FastAPI process serves both the HTML and the `/api/*` endpoints |

The empty-string case is important: `??` fallbacks do **not** trigger for `""`, only for `undefined`/`null`, so `VITE_BACKEND=` (empty) in `.env.production` produces a config where `fetch("/api/...")` resolves against whatever origin served the page. This works for `localhost`, LAN IPs, and production domains without rebuilds.

`debug` is wired to `import.meta.env.DEV` — `true` in `vite dev`, `false` in `vite build`. It is never hardcoded.

### 4.3 Vite Build Output

`vite build` produces `dist/`:

```
dist/
  index.html                # entry HTML, references /assets/*
  assets/
    index-<hash>.js         # app bundle
    index-<hash>.css        # styles
    <asset>-<hash>.<ext>    # images, fonts
```

In the production Docker image, `index.html` is moved to `templates/index.html` and the rest of `dist/` is moved to `static/`. The FastAPI app renders `templates/index.html` (optionally via Jinja) and mounts `static/` at `/`. Vite's default `base: '/'` is therefore correct — no `base` override is needed as long as `static/` is mounted at `/`.

## 5. Mobile

A React Native application targeting Android (iOS support is limited — see below).

### 5.1 Structure

- `src/pages/` — tab screens (Map, Dues, Schedule, Login).
- `src/components/` — map overlays, form elements, list rows.
- `src/context/` — auth and vehicle state.
- `src/utils/config.ts` — backend URL, version (`package.json.version`), GitHub repo.
- `src/utils/updateManager.ts` — version check, prompt dialog, APK download orchestration.
- `android/` — native Android project, including the custom `AppUpdateModule.kt`.

### 5.2 Location Sharing

The Map tab embeds a WebView that connects to the backend's WebSocket stream. Riders with *share* permission select a vehicle and press Share; the app acquires the device GPS position and pushes it to the backend over the same WebSocket.

### 5.3 Native Update Module

`AppUpdateModule.kt` (under `android/app/src/main/java/dev/moeezraza/obmms/`) exposes three methods to JavaScript:

| Method | Purpose |
|---|---|
| `canRequestPackageInstalls()` | Checks whether `REQUEST_INSTALL_PACKAGES` permission is granted |
| `openInstallPermissionSettings()` | Opens the system settings page for this permission |
| `downloadAndInstallApk(url, name)` | Uses Android `DownloadManager`, then launches `Intent.ACTION_VIEW` with `FileProvider` URI on completion |

The `AndroidManifest.xml` declares `REQUEST_INSTALL_PACKAGES`, and `file_paths.xml` scopes the `FileProvider` so downloaded APKs can be handed to the system installer without exposing other files.

## 6. Update Manager

The updater lets backend, frontend, and mobile modules self-update from GitHub Releases — one shared release stream, three per-module consumers.

### 6.1 Architecture

```
                  GitHub Releases (moeezraza35/OBMMS)
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │ backend-v*              │ frontend-v*             │ mobile-v*
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ FastAPI       │         │ Vite SPA      │         │ React Native  │
│ backend       │         │               │         │ app           │
│               │         │ Polls GitHub  │         │               │
│ Polls GitHub  │         │ Shows banner  │         │ Polls GitHub  │
│ Downloads     │         │ POSTs update  │         │ Shows alert   │
│ backend.zip   │         │ Reloads page  │         │ Downloads APK │
│ Restarts      │         │               │         │ Installs APK  │
└───────┬───────┘         └───────┬───────┘         └───────────────┘
        │                         │
        │                         │ POST /api/system/update/frontend
        │                         ▼
        │                 ┌───────────────┐
        │                 │ Backend:      │
        │                 │ download      │
        │                 │ dist.zip,     │
        │                 │ split into    │
        │                 │ templates/    │
        │                 │ + static/     │
        │                 └───────────────┘
        │
        ▼
   (process restarts)
```

### 6.2 Backend Auto-Updater

The `updater/` package implements backend self-update.

**Configuration** (read from `settings.py`):

| Variable | Purpose |
|---|---|
| `AUTO_UPDATE` | Master switch — when `True`, the background loop runs |
| `VERSION` | Currently installed version (in `settings.py`, not `.env`) |
| `GITHUB_REPO` | `moeezraza35/OBMMS` |
| `GITHUB_TOKEN` | Optional token for API rate limit (60 → 5000 req/h) |
| `UPDATE_CHECK_INTERVAL` | Seconds between checks (default 86400 = 24h) |
| `RELOAD` | Whether to touch `main.py` (uvicorn reload) or `os.execv` on update |

**Cycle** (`Updater.auto_update_loop`):

1. Sleep 10 s after startup (server fully up).
2. If `AUTO_UPDATE`, call `check_for_backend_update()`.
3. Filter GitHub releases to `backend-*`, sort by semver, compare with `VERSION`.
4. If newer, download `backend.zip`, extract to a temp directory.
5. Copy files into `backend/`, preserving `.env`, `venv/`, `__pycache__/`, `.git/`, `uploads/`, and any `*.sqlite / *.db / *.log` files.
6. Rewrite the `VERSION = os.getenv("VERSION", "...")` default in `settings.py` so the next boot starts at the new version.
7. Trigger reload (`os.utime(main.py)` under uvicorn `--reload`; `os.execv` otherwise).
8. Sleep `UPDATE_CHECK_INTERVAL`, repeat.

**Endpoints** (`updater/routes.py`, prefix `/api/system`):

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/updates` | Returns update status for all three modules (current + latest tag, release notes, published_at) |
| `POST` | `/update/backend` | Triggers a backend update in a background task, then restarts |
| `POST` | `/update/frontend` | Triggers a frontend update in a background task — downloads `dist.zip`, splits into `templates/` + `static/` |
| `POST` | `/auto-update/toggle?enable=true\|false` | Turns `AUTO_UPDATE` on/off at runtime (mutates the shared `Updater` instance) |

**Design notes:**

- The `Updater` class takes the `FastAPI` app and registers its own startup hook. It is constructed once in `OBMMS.__init__` alongside `Auth`, `Admin`, etc.
- `routes.py` fetches the singleton via `get_updater()`, which raises if `Updater(app)` was never called.
- `toggle_auto_update` mutates `self.auto_update` on the shared instance — this is the fix for a subtle bug where the loop read a module-level import that never changed.
- Backend update preserves protected files; frontend update uses **atomic directory rename** (`templates` → `templates.old`, `templates.new` → `templates`) with an `EXDEV` fallback for overlayfs (Docker copy-on-write layers). Neither approach restarts the backend — static-file mounts re-resolve paths on every request, so a rename is transparent to the running process.

### 6.3 Frontend Update Flow

**Production (dist mode):**

1. `checkFrontendUpdate()` in `utils/updateManager.js` fetches `https://api.github.com/repos/moeezraza35/OBMMS/releases`.
2. Filters to `frontend-*` tags, sorts by semver, compares against `config.version` (from `package.json.version`).
3. If newer, `UpdateNotifier.jsx` renders a banner.
4. User clicks **Update Now** → `applyFrontendUpdate()` POSTs to `/api/system/update/frontend`.
5. The backend downloads `dist.zip` from the release, extracts, splits, and atomically swaps `templates/` and `static/`.
6. On 200, the browser clears the Cache API and calls `window.location.reload()`.
7. Next page load pulls the new bundle.

**Development (Vite dev mode):**

The backend-update path is intentionally **not** used in dev mode. `vite dev` runs from source on the developer's machine; the backend cannot reach it, and replacing the working tree from a zip would destroy uncommitted work. The frontend in dev mode only shows a banner ("new version available — run `git pull && npm install`"). See [Section 6.6](#66-release-process) for the reasoning.

### 6.4 Mobile Update Flow

**Android:**

1. `fetchLatestMobileRelease()` in `utils/updateManager.ts` fetches GitHub releases, filters `mobile-*`, sorts by semver, compares against `config.version`.
2. On app startup, `checkMobileUpdate()` shows a native `Alert.alert` with release notes.
3. **OK** → `proceedWithUpdate()`:
   - Locates the `.apk` asset in the release.
   - Checks `REQUEST_INSTALL_PACKAGES` via `AppUpdateModule.canRequestPackageInstalls()`.
   - If not granted, opens settings via `openInstallPermissionSettings()`.
   - Otherwise calls `AppUpdateModule.downloadAndInstallApk(url, name)`, which uses Android `DownloadManager` and then launches the system installer.
4. **Cancel** → dismiss for this session.

**iOS:**

Direct IPA sideloading is blocked by iOS policy. The alert opens the release page (`html_url`) in Safari, where the user is redirected to TestFlight or the App Store.

### 6.5 GitHub Actions CI/CD

`.github/workflows/release.yml` publishes release assets when tags are pushed:

| Tag pattern | Workflow action |
|---|---|
| `backend-v*` | Zip `backend/` into `backend.zip` (excluding `.env`, `venv/`, `*.db`), attach to the GitHub release |
| `frontend-v*` | `npm run build` in `frontend/`, zip `dist/` into `dist.zip`, attach to release |
| `mobile-v*` | `./gradlew assembleRelease` in `mobile/obmms/android`, attach `obmms.apk` to release |

The backend updater expects **exactly** these asset names:
- `backend.zip` for backend
- `dist.zip` for frontend (fallback: any `.zip` containing `"dist"` — never `zipball_url`, which is source)

If you rename the artifact, update `find_backend_zip_asset` / `find_frontend_zip_asset` in `updater/helper.py`.

### 6.6 Release Process

Publishing an update requires only a tag push:

**Backend:**

```bash
git tag backend-v0.1.0
git push origin backend-v0.1.0
```

Running FastAPI servers with `AUTO_UPDATE=True` detect the release within `UPDATE_CHECK_INTERVAL`, download `backend.zip`, apply it, and restart.

**Frontend:**

```bash
git tag frontend-v0.1.0
git push origin frontend-v0.1.0
```

Users with the dashboard open see the banner; clicking **Update Now** triggers the backend to download `dist.zip` and swap the served files, then the browser reloads.

**Mobile:**

```bash
git tag mobile-v0.1.0
git push origin mobile-v0.1.0
```

Users with the mobile app open get an alert; tapping **OK** downloads the new APK and hands off to the Android installer.

**Important constraints:**

- **Version tags must match `package.json.version`** for the frontend, and `settings.py` `VERSION` for the backend. The updater compares numeric versions — `frontend-v0.1.0` is compared against `config.version` parsed from `package.json`. If `package.json` still says `"version": "0.0.2"`, every install will see the update as available forever. The CI workflow bumps the version from the tag before building.
- **Draft and pre-release GitHub releases are not excluded by the current updater.** If you publish `mobile-v0.1.0-rc1` as a pre-release, all users will be prompted to update to the RC. Either use a `beta` channel or add `!r.prerelease` filters to the mobile updater — see [CONTRIBUTING.md](CONTRIBUTING.md) for conventions.
- **Frontend in Vite dev mode does not auto-update by design.** See [Section 6.3](#63-frontend-update-flow). Deployments should run `vite build` and serve the result through the backend (dist mode), never `vite dev`.

## 7. Cross-Cutting Concerns

### 7.1 Authentication & Sessions

Two mechanisms coexist:

1. **Starlette `SessionMiddleware`** — a signed cookie (`SESSION_COOKIE`, default `session_id`) carries the logged-in user's ID between requests. Cookie attributes are configured in `settings.py`: `SAME_SITE=lax`, `HTTPS_ONLY=False` (set to `True` when serving over HTTPS).
2. **JWT** — issued at login via `jwt.encode()`, validated per-request. Algorithm and expiry are controlled by `JWT_ALGORITHM`, `JWT_EXPIRE`, `JWT_EXP_TIME` (days). The JWT is used by the mobile app, which does not participate in the cookie session.

Password hashing uses `passlib` with `bcrypt` (`SCHEMES = ["bcrypt"]`, `DEPRECATED = "auto"`).

### 7.2 Error Handling

- Every handler returns a JSON error body with a `status` and `message` key (never a raw exception string).
- Exceptions in `updater/` are logged with `logger.warning` (recoverable) or `logger.error` (fatal) and return `False` to the caller — callers surface a user-facing message.
- The updater routes wrap the actual update in a FastAPI `BackgroundTasks` call; the route returns `202`-style immediately, and errors surface in the server log, not the HTTP response. This is intentional — a 60-second download should not block the request thread.

### 7.3 Configuration & Secrets

- **Never commit `.env` files.** They are in `.gitignore`. The `backend/.env.example` file documents every variable.
- **Never put secrets in `VITE_*` variables.** Everything prefixed `VITE_` is compiled into the browser bundle and visible to anyone with DevTools open.
- `GITHUB_TOKEN` is backend-only. On unauthenticated installs it is `None`, which limits the updater to 60 GitHub API requests per hour. In production deployments, set it to a fine-grained PAT with `public_repo` scope.

## 8. Development Environment

### 8.1 Running the stack

Two modes, chosen by which compose file you use:

**Production (dist) mode** — `docker-compose.yaml`:

```bash
docker compose up --build
```

Builds:
- `frontend-builder` — multi-stage node → alpine, produces `templates/` and `static/`
- `backend` — consumes `frontend-builder`'s filesystem via `additional_contexts` and `COPY --from=frontend`

Serves everything on `:8000`.

**Development mode** — `docker-compose.dev.yml` (overrides):

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yml up
```

Runs `vite dev` on `:3000` with a bind mount of `./frontend`, plus the backend on `:8000` with a bind mount of `./backend`. The frontend talks to the backend over CORS (`ALLOW_ORIGINS` in `settings.py`).

### 8.2 Manual setup

Without Docker, each module has its own setup guide:
- Backend: [backend/README.md](backend/README.md)
- Frontend: [frontend/README.md](frontend/README.md)
- Mobile: [mobile/README.md](mobile/README.md)

Run them in that order — the frontend and mobile app both depend on a running backend.

### 8.3 IDE configuration

The `.vscode/` folder contains shared settings. If you use VS Code, install the recommended extensions (Python, ESLint, Prettier, Docker, Tailwind CSS IntelliSense) — they are listed in `.vscode/extensions.json`.

### 8.4 Code conventions

Coding standards — indentation, import ordering, naming, commit format — are documented in [CONTRIBUTING.md](CONTRIBUTING.md). Read that before submitting a pull request.