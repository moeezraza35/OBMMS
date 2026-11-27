# Online Bus Monitoring & Management System (OBMMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](backend/README.md)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](frontend/README.md)
[![Mobile](https://img.shields.io/badge/Mobile-React%20Native-61DAFB?logo=react)](mobile/README.md)

**OBMMS** is an open-source, self-hosted **real-time bus tracking and fleet management system** for schools, universities, and organizations running private transport services. It combines GPS tracking, package-based access control, fee management, and role-based permissions into a single deployable stack — with a web dashboard for administrators, a mobile app for drivers and passengers, and an API backend that ties everything together.

## Overview

**Online Bus Monitoring & Management System (OBMMS)** is a fully customizable, open-source **school bus / staff transport monitoring software** built for organizations and institutes that provide transportation services to their students, staff, or customers.

OBMMS gives private bus, van, and shuttle operators a single place to **manage vehicles, packages, user access control, live locations, and payments**. Whether you're running a university shuttle service, a corporate staff bus fleet, or a school van network, OBMMS provides the tracking, monitoring, and administration tools you need — without vendor lock-in.

This is a **monorepo** project: the frontend, backend, and React Native mobile app all live in a single repository, versioned and released together.

### Objectives

1. Provide **real-time vehicle tracking** on a live map for administrators and passengers.
2. Reduce **waiting time** and prevent passengers from **missing their bus** with accurate arrival information.
3. Improve the **safety and monitoring** of students during travel.
4. Deliver **fully customizable, role-based access control** across every module.
5. Enable **payment management** and **package-based access** to transportation services.

## Features

- **Real-Time Tracking** — Live location sharing over WebSockets. Vehicles appear on a shared map with sub-second updates for administrators and authorized riders.
- **Role-Based Access Control (RBAC)** — Every model supports three granular permission levels per role: *Not Allowed*, *Read Only*, and *Read & Write*. Designations are configurable without touching code.
- **Package-Based Access** — Packages represent paid transportation services. A user with an active package can access location data even if their role otherwise restricts it — a clean separation between *permission* and *entitlement*.
- **Self-Update Mechanism** — All three modules (frontend, backend, mobile) can update themselves from GitHub releases. Backend and frontend update in place with atomic file swaps; the mobile app notifies users of new APK releases.
- **GPS Tracker Integration** — Locations can be pushed by an onboard GPS tracker or the driver's mobile device. Multiple sources supported with a single authoritative stream per vehicle.
- **Route, Stop & Schedule Management** — Campus stops, checkpoints, and route schedules are all editable from the admin dashboard.
- **Payment & Fee Management** — Track dues, package activation, and payment history per student or staff member.

## The Problem

Students frequently face difficulties because they do **not know the exact location or arrival time** of their university bus. This leads to missed buses, long waits in unsafe or weather-exposed conditions, and stress before class starts. Drivers have no way to signal delays. Parents have no visibility into when their child boarded or arrived.

Meanwhile, **managing student transport fees manually** creates errors, confusion, and heavy administrative workload. A single missed payment entry, a duplicated student record, or an unresolved complaint can take hours to reconcile.

No existing open-source tool combines **real-time bus tracking** and **accurate student fee records** in a single self-hosted system. Commercial solutions cost per-vehicle fees and lock customer data behind SaaS walls. OBMMS exists to close that gap.

## Tech Stack

### Frontend
- **React 18** — Component-based UI for fetching and rendering live data
- **ViteJS** — Fast dev server and optimized production builds
- **Tailwind CSS** — Utility-first styling
- **React Leaflet + OpenStreetMap** — Map rendering and geospatial display

### Backend
- **Python 3.11+** — Backend runtime
- **FastAPI** — High-performance async API framework with automatic OpenAPI docs
- **SQLAlchemy 2.0** — ORM with native async support
- **MySQL 8** — Relational database
- **PyJWT** — Stateless authentication tokens
- **mr-wshandler** — Lightweight WebSocket handler ([GitHub](https://github.com/moeezraza35/mr_wshandler_fastapi))

### Mobile
- **React Native** — Cross-platform Android and iOS app
- **TypeScript** — Type-safe mobile development
- **React Navigation** — Screen navigation
- **react-native-keychain** — Secure credential storage
- **react-native-webview** — Embedded map views

### Tooling
- **Docker & Docker Compose** — Containerized deployment
- **Git & GitHub** — Version control, releases, and self-update source
- **Visual Studio Code / Android Studio** — Primary IDEs

## Architecture

OBMMS is composed of **three deployable modules** that share a single backend API:

- **Backend (`backend/`)** — FastAPI application serving REST endpoints under `/api/*`, WebSocket streams under `/ws/*`, the admin frontend (when bundled), and the self-update management routes. Connects to MySQL via SQLAlchemy. Handles authentication via session cookies + JWT.
- **Frontend (`frontend/`)** — Vite-built React SPA. In development it runs on `:3000` and talks to the backend on `:8000`. In production its build output is baked into the backend image and served from `/` and `/static/`.
- **Mobile (`mobile/`)** — React Native app for Android (and iOS). Consumes the same `/api/*` endpoints. Receives APK updates by polling GitHub releases and handing the download to the native installer.

The backend is the single source of truth. Frontend and mobile both speak to it. WebSockets push location updates; REST handles everything else. The `updater/` package inside the backend implements the self-update mechanism described in *Features*.

## System Requirements

To run OBMMS, the following must be installed depending on your chosen setup method.

### For Docker setup (recommended)
- **Docker Engine 24+** (or **Docker Desktop** on Windows/macOS)
- **Docker Compose v2.17+** (required for `additional_contexts` in the backend build)
- **Git**

### For manual setup
- **Python 3.11+**
- **Node.js LTS (20 or 22)** and **npm**
- **MySQL 8** (running locally or on a reachable host)
- **Git**

### For mobile development
- **OpenJDK 17** (Microsoft OpenJDK recommended)
- **Android Studio** with:
  - Android SDK Platform 36
  - Sources for Android 36
  - Android 16 (Baklava) system image
- **Android device or emulator** running Android 11 or newer

## Setup Guide

OBMMS supports **two installation methods**. Docker is recommended for production and for anyone who wants a working instance without touching Python or Node environments. Manual setup is recommended for development and for modifying the source.

### Method 1 — Docker (Recommended)

Docker bundles the backend, the built frontend, and MySQL into a reproducible stack. You do not need Python or Node installed on your host.

1. **Clone the repository**

   ```
   git clone https://github.com/moeezraza35/OBMMS.git
   cd OBMMS
   ```

2. **Create the backend environment file**

   Copy `backend/.env.example` to `backend/.env` and fill in the values. Variables marked **Required** have no safe default — the backend will not start, or will start insecurely, without them. Variables marked **Optional** fall back to the defaults shown, which are usually fine for local development.

   **Server**

   | Variable | Required? | Description | Default |
   |---|---|---|---|
   | `HOST` | Optional | Interface the server binds to | `0.0.0.0` |
   | `PORT` | Optional | Port the server listens on | `8000` |
   | `RELOAD` | Optional | Auto-reload on code change (dev only) | `True` |

   **Session & Authentication**

   | Variable | Required? | Description | Default |
   |---|---|---|---|
   | `SECRET_KEY` | **Required** | Session signing key. Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. No default — the app will refuse to start without it. | — |
   | `JWT_ALGORITHM` | **Required** | JWT signing algorithm | — |
   | `JWT_EXPIRE` | Optional | Whether tokens expire (`True`/`False`). Note: the Python variable is spelled `JWT_EXIPRE` in `settings.py`, but the **env key** is `JWT_EXPIRE`. | `False` |
   | `JWT_EXP_TIME` | Optional | Token lifetime in **days** | `30` |

   **Database**

   | Variable | Required? | Description | Default |
   |---|---|---|---|
   | `DB_DIALECT` | Optional | SQL dialect | `mysql` |
   | `DB_HOST` | Optional | MySQL host. In Docker with host-based MySQL, use `host.docker.internal`. | `127.0.0.1` |
   | `DB_PORT` | Optional | MySQL port | `3306` |
   | `DB_NAME` | Optional | Database name | `obmms` |
   | `DB_DRIVER` | Optional | Python DBAPI driver | `pymysql` |
   | `DB_USERNAME` | Optional | MySQL user | `root` |
   | `DB_PASSWORD` | **Required** | MySQL password. Defaults to empty, which only works if your MySQL root has no password — almost never the case. | `""` |
   | `DB_ECHO` | Optional | Log every SQL statement (noisy) | `False` |

   **Auto-Update**

   | Variable | Required? | Description | Default |
   |---|---|---|---|
   | `AUTO_UPDATE` | Optional | Poll GitHub for new backend releases | `True` |
   | `GITHUB_REPO` | Optional | Release source repository | `moeezraza35/OBMMS` |
   | `GITHUB_TOKEN` | Optional | Personal access token for higher GitHub API rate limits (60 → 5000 req/hour). Recommended in production. | `None` |
   | `UPDATE_CHECK_INTERVAL` | Optional | Seconds between update checks | `86400` (24h) |

   **Hardcoded settings (not env-configurable)** — these live in `settings.py` and must be edited in source if you need to change them: `SESSION_COOKIE`, `SAME_SITE`, `HTTPS_ONLY`, `ALLOW_ORIGINS`, `ALLOW_CREDENTIALS`, `ALLOW_HEADERS`, `ALLOW_METHODS`, `MODELS`, and `VERSION`.

   A minimal working `backend/.env` for local Docker looks like this:

   ```
   SECRET_KEY=<64-char hex string>
   JWT_ALGORITHM=HS256
   DB_HOST=host.docker.internal
   DB_PASSWORD=your_mysql_password
   ```

3. **Create the frontend environment file** *(only needed for manual setup — the Docker build bakes these in at build time)*

   Copy `frontend/.env.example` to `frontend/.env.development` (for `npm run dev`) and `frontend/.env.production` (for `npm run build`). Only variables prefixed with **`VITE_`** are exposed to the browser bundle.

   | Variable | Required? | Description | Default |
   |---|---|---|---|
   | `VITE_BACKEND` | **Required in dev** | Full URL of the backend API. In dev, must be the backend origin (e.g. `http://localhost:8000`). **In production leave this empty** (`VITE_BACKEND=`) so requests go to the same origin that served the page. | `http://localhost:8000` |
   | `VITE_FRONTEND` | Optional | Frontend base URL (used for self-referencing links) | `http://localhost:3000` |
   | `VITE_API_PREFIX` | Optional | API path prefix | `/api/` |
   | `VITE_STATIC_DIR` | Optional | Static assets path prefix | `/` |
   | `VITE_GITHUB_REPO` | Optional | Release source repo for the frontend updater | `moeezraza35/OBMMS` |

   Example `frontend/.env.development`:

   ```
   VITE_BACKEND=http://localhost:8000
   VITE_FRONTEND=http://localhost:3000
   ```

   Example `frontend/.env.production` (empty values → same-origin; the backend serves the built bundle):

   ```
   VITE_BACKEND=
   VITE_FRONTEND=
   ```

   **Never put secrets in frontend env files.** Every `VITE_*` value is compiled into the JavaScript bundle and visible to anyone who opens DevTools. GitHub tokens, database passwords, and JWT secrets belong only in `backend/.env`.

4. **Start the stack**

   ```
   docker compose up --build -d
   ```

5. **Create the database and admin user** (first run only)

   ```
   docker compose exec backend python main.py create_tables
   docker compose exec -it backend python main.py create_super_user
   ```

6. **Open the app** at **http://localhost:8000**.

### Method 2 — Manual Setup

Each module has its own detailed setup guide. Install and run them in this order:

1. **Backend** — [backend/README.md](backend/README.md)  
   Covers Python virtual environment, MySQL database creation, `.env` configuration, table migrations, and the super-user bootstrap. **Start the backend first** — the frontend and mobile app both depend on it.

2. **Frontend** — [frontend/README.md](frontend/README.md)  
   Covers `npm install`, Vite dev server, environment variables (`VITE_BACKEND`, `VITE_FRONTEND`, `VITE_API_PREFIX`), and production build steps.

3. **Mobile** — [mobile/README.md](mobile/README.md)  
   Covers React Native environment setup, Android Studio configuration, emulator/device setup, and running `npm run android`. Requires a reachable backend URL — point the mobile app at your backend's LAN IP (not `localhost`) when testing on a physical device.

### Production Deployment Notes

- The backend serves the built frontend in production via `templates/index.html` and `static/`. When you build the frontend, its `dist/` output is split into those two folders and baked into the backend image.
- If your MySQL runs on the host (not in Docker), the backend container reaches it via `host.docker.internal`. On Linux this requires the `extra_hosts` entry already present in `docker-compose.yml`.
- Reverse proxy (nginx / Caddy) is not included. For a public deployment, terminate TLS in front of the backend and forward `/` and `/api/*` to `:8000`.

## Usage

### Admin Site

The admin dashboard is accessible at the backend root (`http://localhost:8000` in Docker, or the frontend dev server at `http://localhost:3000` when running manually).

- **Login** — Use the top-right login button and enter the credentials created during setup. After login, click the profile button and select **Dashboard**.
- **Dashboard** — Shows the system activity log. Admins can delete logs; non-admin users with the appropriate permission can view them.
- **Users** — People who use the application. Create and manage users here.
- **Groups** — Designations. Assign a group to define what its members can access. Three permission levels per model:
  1. **Not Allowed** — The user cannot access the resource from the admin panel.
  2. **Read Only** — The user can see the data but cannot edit it.
  3. **Read & Write** — Full CRUD access to the model.

  Every model supports Create, Read, Update, and Delete — except **History** and **Location**, which are write-and-delete only. Deleting historical records is not recommended; only administrators should have the permission to do so.

- **Locations** — Written by the GPS tracker and by users with write access to the Location model. Users with *write* permission also gain the ability to see other vehicles' locations — grant this permission carefully.

- **Stops** — Click on the map to place a new stop, then mark whether it's a campus location or a route checkpoint. The *Active / Inactive* toggle controls whether the stop is currently in service.

### Mobile App

1. **Login** — Sign in with the credentials created on the admin site.
2. **Map tab** — Shows the live location of vehicles you are permitted to view. If you have permission to *share* a vehicle's location, select it and press **Share** to begin broadcasting.
3. **Dues tab** — Shows active packages and payment history. A user with an active package can view locations even if their role otherwise restricts it.
4. **Schedule tab** — Search and sort bus schedules by route, stop, or time.

## Authors

This project is developed by:

1. **Moeez Raza** — [moeez.raza.dev@gmail.com](mailto:moeez.raza.dev@gmail.com)
2. **Muneeba Munir** — [muneebamunir855@gmail.com](mailto:muneebamunir855@gmail.com)
3. **Maham Maqsood** — [mahammaqsood2803@gmail.com](mailto:mahammaqsood2803@gmail.com)

This is project is supervised by:

1. **Sir Ameer Hamza** — [ameer.hamza@riphah.edu.pk](mailto:ameer.hamza@riphah.edu.pk)

## References

- [Vite — Getting Started](https://vite.dev/guide/)
- [React — Tutorial](https://www.w3schools.com/react/)
- [React Router](https://reactrouter.com/home)
- [Tailwind CSS — Install with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [FastAPI — Introduction](https://www.geeksforgeeks.org/python/fastapi-introduction/)
- [FastAPI — Uvicorn](https://www.tutorialspoint.com/fastapi/fastapi_uvicorn.htm)
- [SQLAlchemy — ORM Quickstart](https://docs.sqlalchemy.org/en/20/orm/quickstart.html)
- [SQLAlchemy — TutorialsPoint](https://www.tutorialspoint.com/sqlalchemy/)
- [Using MySQL with SQLAlchemy — PlanetScale](https://planetscale.com/blog/using-mysql-with-sql-alchemy-hands-on-examples)
- [FastAPI — Static Files](https://www.tutorialspoint.com/fastapi/fastapi_static_files.htm)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/en/stable/)
- [React Leaflet](https://react-leaflet.js.org)
- [OpenStreetMap](https://www.openstreetmap.org)
- [HTTP Status Codes Reference](https://www.w3schools.com/tags/ref_httpmessages.asp)
- [React Native — Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment)
- [React Native — Navigation](https://reactnative.dev/docs/navigation)
- [React Native — Networking](https://reactnative.dev/docs/network)
- [react-native-webview](https://www.npmjs.com/package/react-native-webview)
- [react-native-keychain](https://www.npmjs.com/package/react-native-keychain)
- [FastAPI — WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [mr-wshandler — FastAPI](https://github.com/moeezraza35/mr_wshandler_fastapi)
- [mr-wshandler — React](https://github.com/moeezraza35/mr-wshandler-react)

## License

Copyright (c) 2026 Moeez Raza. All rights reserved.

Released under the **MIT License**. See [LICENSE.md](LICENSE.md) for the full text.