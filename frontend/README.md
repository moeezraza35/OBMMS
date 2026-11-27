# OBMMS Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

The **administrative web interface** for the Online Bus Monitoring & Management System (OBMMS). Built with React 19 + Vite 7 and styled with Tailwind CSS 4.

This README covers how to run the frontend locally. For the backend, see [../backend/README.md](../backend/README.md). For the mobile app, see [../mobile/README.md](../mobile/README.md).

## Overview

This is the **admin dashboard** for staff who operate the transportation service — **Administrator**, **Bus Manager**, and **Accountant**. It is not the rider app.

A passenger with an active package *can* open the same URL and read data their package grants (enforced by the backend), but this is not the recommended path. Riders should use the [mobile app](../mobile/README.md). Do not distribute the admin URL to passengers.

## Requirements

- **Node.js 20.19+ or 22.12+** (Vite 7 requirement) — [download LTS](https://nodejs.org/)
- **npm** — bundled with Node
- **Git**
- **A running backend** on `:8000` — see [../backend/README.md](../backend/README.md)

Verify your Node version before continuing:

```bash
node --version    # → v20.19+ or v22.12+
```

## Setup

### 1. Enter the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

Run this once after cloning, and again whenever `package.json` changes (e.g. after `git pull`).

### 3. Create the `.env` file

The project does **not** ship an env file — you create one yourself. Inside `frontend/`, next to `package.json`, create a file named **`.env`** with:

```
VITE_BACKEND=http://localhost:8000
```

That's the only required key. Change `VITE_BACKEND` if your backend runs on a different host or port. Other keys have safe defaults — see [Environment Variables](#environment-variables).

> After creating or editing `.env`, restart the dev server (Vite does not hot-reload env files).

### 4. Start the development server

```bash
npm run dev
```

Vite prints:

```
  VITE v7.x.x  ready in 312 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

Open **http://localhost:3000** in your browser. Changes to source files hot-reload automatically.

If login or data requests fail, the backend is not running or `VITE_BACKEND` points at the wrong host — start the backend first ([../backend/README.md](../backend/README.md)).

## Environment Variables

All variables must start with **`VITE_`** — Vite only exposes prefixed keys to the browser bundle. Put them in `frontend/.env`.

| Variable | Required? | Description | Default |
|---|---|---|---|
| `VITE_BACKEND` | **Yes** | Full URL of the OBMMS backend | `http://localhost:8000` |
| `VITE_FRONTEND` | Optional | Frontend base URL, used for self-referencing links | `http://localhost:3000` |
| `VITE_API_PREFIX` | Optional | API path prefix appended to `VITE_BACKEND` | `/api/` |
| `VITE_STATIC_DIR` | Optional | Static-assets path prefix | `/` |
| `VITE_GITHUB_REPO` | Optional | GitHub repository for the update checker | `moeezraza35/OBMMS` |

**Never put secrets in `VITE_*` variables** — they compile into the JavaScript bundle and are visible in DevTools. Tokens, database passwords, and JWT secrets belong in `backend/.env` only.

> `.env` is in `.gitignore`. Do not commit it.

## Building for Production

```bash
npm run build
```

Output lands in `frontend/dist/`. In production the frontend is **served by the backend**: `dist/index.html` goes into `backend/templates/` and the rest of `dist/` goes into `backend/static/`. The repo's Docker stack handles this automatically — `docker compose up --build` at the repo root builds the frontend, splits it, and bakes it into the backend image.

### Preview the build locally

```bash
npm run preview
```

Serves `dist/` on `http://localhost:4173`. Useful for a final check before deploying.

## License

Copyright (c) 2026 Moeez Raza. Released under the **MIT License**. See [../LICENSE.md](../LICENSE.md).