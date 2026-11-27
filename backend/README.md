# OBMMS Backend

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)

The **REST API, WebSocket server, and database layer** for the Online Bus Monitoring & Management System (OBMMS). Built with Python 3.11, FastAPI, SQLAlchemy 2.0, and MySQL 8.

This README covers how to run the backend locally. For the frontend, see [../frontend/README.md](../frontend/README.md). For the mobile app, see [../mobile/README.md](../mobile/README.md).

## Overview

The backend is the **single source of truth** for OBMMS. It serves every REST endpoint under `/api/*`, streams live vehicle locations over WebSocket, enforces authentication and role-based permissions, and — in production — serves the built frontend from `templates/` and `static/`. It also houses the self-update manager that lets backend, frontend, and mobile modules update themselves from GitHub releases.

In development, the backend runs on `:8000` and the frontend dev server on `:3000` talks to it via CORS. In production, the backend serves both the API and the SPA on `:8000`.

## Requirements

- **Python 3.11+** — [download](https://www.python.org/downloads/)
- **MySQL 8** — running locally or reachable on the network ([download](https://dev.mysql.com/downloads/))
- **pip** — bundled with Python
- **Git**

Verify:

```bash
python --version    # → Python 3.11.x or newer
mysql --version     # → mysql Ver 8.x
```

## Setup

### 1. Enter the backend folder

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Run this once. It creates a `venv/` folder containing an isolated Python interpreter for this project.

### 3. Activate the virtual environment

**Windows:**

```bash
.\venv\Scripts\activate
```

**Linux / macOS:**

```bash
source ./venv/bin/activate
```

Your shell prompt will show `(venv)` when it's active. You must activate it every time you open a new terminal.

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

Run this once after creating the venv, and again whenever `requirements.txt` changes.

### 5. Create the `.env` file

The project does **not** ship an env file — you create one yourself. Inside `backend/`, next to `main.py`, create a file named **`.env`** with at minimum:

```
SECRET_KEY=<64-char random hex string>
JWT_ALGORITHM=HS256
DB_PASSWORD=<your_mysql_password>
```

The remaining keys have safe defaults — see [Environment Variables](#environment-variables). Generate a `SECRET_KEY` with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

> After editing `.env`, restart the server (the backend does not hot-reload env changes).

### 6. Initialize the database

If the database tables don't exist yet:

```bash
python main.py migrate
```

This creates every table defined by the models — `Users`, `Groups`, `Buses`, `Routes`, `Stops`, `Packages`, `History`, `Location`.

### 7. Create an admin user

```bash
python main.py createsuperuser
```

You'll be prompted for an ID (or auto-assigned), name, and password. This is the **Administrator** account — from the admin dashboard you can create Bus Manager and Accountant users.

### 8. Run the development server

```bash
python main.py runserver
```

The server starts on **http://localhost:8000**. Uvicorn's auto-reload is enabled by default (`RELOAD=True` in `.env`), so code changes restart the server automatically.

Stop the server with **Ctrl + C**.

## Environment Variables

All variables go in `backend/.env`. They are loaded by `obmms/settings.py` at import time.

| Variable | Required? | Description | Default |
|---|---|---|---|
| `SECRET_KEY` | **Yes** | Session signing key. Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. | — |
| `JWT_ALGORITHM` | **Yes** | JWT signing algorithm | — |
| `DB_PASSWORD` | **Yes** | MySQL password | `""` (empty) |
| `DB_HOST` | Optional | MySQL host | `127.0.0.1` |
| `DB_PORT` | Optional | MySQL port | `3306` |
| `DB_NAME` | Optional | Database name | `obmms` |
| `DB_USERNAME` | Optional | MySQL user | `root` |
| `DB_DIALECT` | Optional | SQL dialect | `mysql` |
| `DB_DRIVER` | Optional | Python DBAPI driver | `pymysql` |
| `DB_ECHO` | Optional | Log every SQL statement (noisy) | `False` |
| `HOST` | Optional | Server bind interface | `0.0.0.0` |
| `PORT` | Optional | Server port | `8000` |
| `RELOAD` | Optional | Auto-reload on code change (dev only) | `True` |
| `JWT_EXPIRE` | Optional | Whether tokens expire | `False` |
| `JWT_EXP_TIME` | Optional | Token lifetime in **days** | `30` |
| `AUTO_UPDATE` | Optional | Poll GitHub for new backend releases | `True` |
| `GITHUB_REPO` | Optional | Release source repository | `moeezraza35/OBMMS` |
| `GITHUB_TOKEN` | Optional | Personal access token for higher GitHub API rate limits (60 → 5000 req/h). Recommended in production. | *(none)* |
| `UPDATE_CHECK_INTERVAL` | Optional | Seconds between update checks | `86400` (24h) |

**Never commit `.env`.** It is in `.gitignore`. Keep credentials, tokens, and the secret key out of version control.

## Available CLI Commands

| Command | Description |
|---|---|
| `python main.py migrate` | Create the database tables defined by the models |
| `python main.py createsuperuser` | Create an Administrator account (interactive) |
| `python main.py runserver` | Start the FastAPI dev server on `:8000` with auto-reload |

## Production Deployment

The repo's Docker stack builds and runs the full backend in production, including the built frontend:

```bash
docker compose up --build
```

At the repo root. The backend image consumes the frontend build via `additional_contexts` (see `docker-compose.yaml`) and serves both the API and the SPA on `:8000`.

For a production deployment, also set `RELOAD=False` and `GITHUB_TOKEN` in `backend/.env`, and terminate TLS in front of the backend (nginx / Caddy) so session cookies can be marked `Secure`.

## License

Copyright (c) 2026 Moeez Raza. Released under the **MIT License**. See [../LICENSE.md](../LICENSE.md).