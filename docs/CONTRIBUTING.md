# Contributing to OBMMS

Thank you for your interest in improving the **Online Bus Monitoring & Management System (OBMMS)**. This document defines the coding standards, commit conventions, and workflow every contributor must follow. Please read it fully before opening your first pull request.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Before You Start](#before-you-start)
3. [Code Style](#code-style)
4. [Environment Variables](#environment-variables)
5. [Commit Guidelines](#commit-guidelines)
6. [Branch Naming](#branch-naming)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [Reporting Bugs](#reporting-bugs)
10. [Reporting Security Issues](#reporting-security-issues)
11. [License](#license)

## Code of Conduct

Be respectful. Disagreements about code are fine; personal attacks are not. Harassment, discrimination, and hostile behaviour will result in removal from the project. If you witness or experience unacceptable behaviour, contact the maintainers at [moeez.raza.dev@gmail.com](mailto:moeez.raza.dev@gmail.com).

## Before You Start

1. **Fork** the repository and clone your fork locally.
2. **Set up** the module(s) you plan to work on:
   - Backend: [backend/README.md](backend/README.md)
   - Frontend: [frontend/README.md](frontend/README.md)
   - Mobile: [mobile/README.md](mobile/README.md)
3. **Create a branch** off `master` (see [Branch Naming](#branch-naming)).
4. **Make your changes**, following the code style below.
5. **Test** your changes locally.
6. **Open a pull request** against `master` (see [Pull Request Process](#pull-request-process)).

## Code Style

These rules apply to **every file** in the repository — Python, JavaScript, TypeScript, and configuration.

### Indentation

**Use exactly 2 spaces. No tabs. No 4 spaces.**

Applies to all languages and file types: `.py`, `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.yaml`, `.yml`, `.html`, `.css`.

```python
✅ 2 spaces
  def example():
    return True

❌ 4 spaces
    def example():
        return True

❌ tab
	def example():
		return True
```

> **Note:** Tools like `Black`, `autopep8`, and `yapf` default to 4-space indentation and will silently reformat your code away from this convention. **Do not run them on this project** unless you've verified they respect 2 spaces.

### Python Import Order

Imports are grouped in this exact order — **long single-line imports first, multi-line second, short imports last**. Within each group, third-party (other) libraries come before built-in libraries.

```python
# 1. Long library (third-party) imports first
from fastapi import FastAPI, APIRouter, Depends
from sqlalchemy.orm import Session

# 2. Long local imports second
from obmms.database import get_session, ENGINE
from obmms.models import Users

# 3. Multi-line imports third
from obmms.settings import (
  HOST,
  PORT,
  SECRET_KEY,
  JWT_ALGORITHM
)

# 4. Short imports last — third-party before built-in
import requests
import json
import os
import sys
```

#### Rules:

- **Category order is fixed:** long → multi-line → short.
- **Within the long group:** third-party libraries before local modules.
- **Within any group:** third-party ("other") before built-in (stdlib).
- Never mix categories — a `from x import y` (long) must never follow `import os` (short).
- One blank line between groups; no blank line within a group.

> **Note:** `isort` follows PEP 8 (stdlib → third-party → local), which is the **opposite** of this project's convention. **Do not run `isort`** on this codebase.

### JavaScript / TypeScript Import Order

```javascript
// 1. Long non-default library imports first
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

// 2. Long non-default local imports second
import { static_dir, api_prefix } from "../config"
import { request } from "../utils/request"

// 3. Multi-line imports third
import react, {
  useRef,
  useMemo
} from "react"

// 4. Long default imports fourth
import makeRequest from "../utils/request"
import App from "./App"

// 5. Small imports last
import "../assets/icon.png"
import "./styles.css"
```

#### Rules:

- Named imports (`import { x } from "..."`) always come before default imports (`import x from "..."`).
- Library imports before local imports within each category.
- Side-effect imports (`import "..."`) come last.
- No semicolons at end of import statements (match existing files).
- Double quotes preferred (match existing files).

### Naming Conventions

| Language | Construct | Convention | Example |
|---|---|---|---|
| Python | Variables, functions | `snake_case` or `camelCase` | `user_id` / `userId`, `get_session` / `getSession` |
| Python | Classes, Models | `PascalCase` | `Updater`, `Users`, `OBMMS` |
| Python | Constants | `UPPER_SNAKE_CASE` | `SECRET_KEY`, `DB_HOST` |
| JavaScript / TS | Variables, functions | `camelCase` or `snake_case` | `userId` / `user_id`, `fetchReleases` / `fetch_releases` |
| JavaScript / TS | Classes, React components | `PascalCase` | `LoginForm`, `UpdateManager` |
| JavaScript / TS | Constants | `UPPER_SNAKE_CASE` (module-level) or `camelCase` (local) | `API_PREFIX`, `apiPrefix` |

| Construct | Convention | Example |
|---|---|---|
| Table names | `PascalCase` (matches model class name) | `Users`, `Buses`, `Packages`, `Locations` |
| Column names | `snake_case` | `reset_required`, `created_at`, `is_admin` |

### Strings and Quotes

- **Python:** double quotes preferred — `os.getenv("HOST")` — but be consistent within a file.
- **JavaScript / TypeScript:** double quotes preferred — `import { x } from "react"` — but be consistent within a file.
- Use template literals (`` `...` ``) for string interpolation in JS/TS — not `"a" + b + "c"`.
- Escape single quotes inside double-quoted strings rather than switching quotes: `"it's fine"`, not `'it\'s fine'`.

### Line Length

- **Maximum 100 characters** per line (recommended).
- If a line must be split, use parentheses (Python) or a proper line break (JS/TS) — never backslash continuation in Python.
- Long import lists are the exception — see the multi-line import examples above.

### Comments and Documentation

- **Python functions and classes** get a docstring:
  ```python
  def compare_versions(v1: str, v2: str) -> int:
    """
    Compare two version strings numerically.
    Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal.
    """
  ```
- **Public JavaScript / TypeScript functions** get a JSDoc comment:
  ```javascript
  /**
   * Fetches GitHub releases and checks for frontend updates.
   * @returns {Promise<{hasUpdate: boolean, currentVersion: string}>}
   */
  export async function checkFrontendUpdate() { ... }
  ```
- **Inline comments** explain *why*, not *what*. If the code needs a comment to explain *what* it does, rename the variable instead.
- Do not leave commented-out code in a PR. Use `git` or the PR discussion to preserve history.

### Error Handling

- **Never swallow exceptions silently.** Log a warning or return a typed error.
  ```python
  ✅
  except Exception as e:
    logger.warning(f"Could not update VERSION: {e}")
    return False

  ❌
  except Exception:
    pass
  ```
- **Do not catch `BaseException`** or bare `Exception` unless you re-raise or log meaningfully.
- **Async functions** must either propagate errors or handle them — never fire-and-forget without `.catch()` in JS/TS.
- **External calls** (HTTP, database, file I/O) must have timeouts. Use the configured timeouts in `updater/helper.py` as reference.

### File and Folder Naming

- All lowercase for module/folder names — `updater/`, `auth/`, `helper.py`.
- No spaces in filenames. Use hyphens or underscores.
- Keep folder names plural for collections (`routes/`, `models/`) and singular for single-file modules (`helper.py`, `config.js`).

## Environment Variables

- **Never commit `.env` files.** They are in `.gitignore` — verify with `git status` before staging.
- **Document every new env var** in the relevant module's `README.md` (backend, frontend, or mobile) — required vs. optional, default value, and example.
- **Backend secrets** (database passwords, `SECRET_KEY`, `GITHUB_TOKEN`) belong only in `backend/.env`.
- **Frontend env vars** must start with `VITE_` to be exposed to the browser. Never put secrets in `frontend/.env*` — they compile into the JS bundle and are visible to anyone who opens DevTools.
- **Verify spelling.** A misspelt env key (e.g., `JWT_EXIPRE` vs `JWT_EXPIRE`) silently returns `None`, which is the source of several past bugs. Double-check against `settings.py` before committing.

## Commit Guidelines

### Format

```
<Prefix>: <short message>
```

One space after the colon. Subject line only — no period at the end.

### Prefixes

| Prefix | Meaning | Example |
|---|---|---|
| `Feat` | A new feature | `Feat: Add frontend self-update endpoint` |
| `Fix` | A bug fix | `Fix: Resolve EXDEV error on frontend update` |
| `Style` | Formatting, styling, no logic change | `Style: Reformat routes.py to 2-space indent` |
| `Recf` (or `Refactor`) | Code restructuring, no behaviour change | `Recf: Split updater into helper and routes` |
| `Docs` | Documentation only | `Docs: Complete setup guide for Docker` |
| `Test` | Adding or updating tests | `Test: Add version comparison unit tests` |
| `Chore` | Maintenance (deps, config, build) | `Chore: Bump Vite to 5.4` |
| `Perf` | Performance improvement | `Perf: Cache GitHub release responses` |
| `Build` | Build system or Dockerfile | `Build: Add dist.zip artifact to frontend image` |
| `Ci` | CI/CD pipeline changes | `Ci: Publish dist.zip on frontend-v* tag` |

### Rules

- **Subject line under 72 characters.**
- **Imperative mood** — "Add feature", not "Added feature" or "Adds feature".
- **Do not add a period** at the end of the subject.
- **Body (optional)** — leave one blank line after the subject, then explain *why* (not *what* — the diff already shows *what*).
- **One logical change per commit.** Don't mix a bug fix with a refactor in the same commit.
- **Squash fixup commits** before opening a PR. `"Fix: Fix the fix"` commits should not survive to `main`.

### Examples

```
✅
Feat: Add frontend self-update endpoint
Fix: Resolve EXDEV error when renaming templates directory
Docs: Document all backend environment variables

❌
added frontend update endpoint              (lowercase, past tense)
Fix: fixed bug.                             (past tense, period)
Update stuff                                (no prefix, vague)
Feat: Add frontend self-update endpoint, fix EXDEV, update docs, bump vite
                                            (four changes in one commit)
```

## Branch Naming

Branch names mirror commit prefixes. Format:

```
<type>/<short-kebab-description>
```

| Type | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `style/` | Formatting |
| `refactor/` | Restructuring |
| `docs/` | Documentation |
| `test/` | Test additions |
| `chore/` | Maintenance |

Examples:

```
feat/frontend-self-update
fix/exdev-templates-rename
docs/complete-setup-guide
refactor/updater-package-split
```

- All lowercase.
- Hyphens between words, not underscores or spaces.
- No issue number in the branch name — reference it in the PR body instead.

## Pull Request Process

1. **Open the PR against `main`.** All PRs are merged into `main` — no long-lived feature branches.
2. **Title the PR with the commit convention:** `Feat: Add frontend self-update endpoint`. Same prefix rules as commits.
3. **Fill out the PR description** with:
   - **What changed** — one-paragraph summary.
   - **Why** — the problem this solves, or the issue number (`Closes #42`).
   - **How tested** — commands you ran, screenshots if UI, curl outputs if API.
   - **Breaking changes** — flag any changes to the API, env vars, or data schema.
4. **Keep the PR small.** Aim for under ~400 lines of change. Large PRs take longer to review and are more likely to be rejected. Split mechanical refactors from behavioural changes.
5. **Rebase, don't merge.** `git rebase main` to bring your branch up to date. Merge commits pollute history.
6. **Ensure CI passes.** If a check fails for reasons unrelated to your change, mention it in the PR thread.
7. **One approval required** before merge. Maintainers will review within a few days.
8. **Squash on merge** — the merge commit will use your PR title as the commit message, so make sure it follows the convention.

## Testing

- **Before opening a PR**, verify that:
  - The app builds (`docker compose build` for the full stack, or `npm run build` for the frontend alone).
  - The affected endpoints respond correctly (`curl` examples in the PR description are welcome).
  - No new errors appear in the backend logs (`docker compose logs -f backend`).
- **For changes to `updater/`**, manually test:
  - Version comparison edge cases (e.g., `0.1.0` vs `0.1.0-beta`, `None` vs `"0.1.0"`).
  - The self-update flow with a real or mock GitHub release.
  - Rollback: after an update, `templates.old/` and `static.old/` still exist and can be renamed back.
- **For changes to `auth/`**, test with both a valid and an expired JWT.
- **For frontend changes**, test in both dev (`npm run dev`) and a production build (`npm run build` + `vite preview`).
- **There is currently no automated test suite.** If you're adding substantial logic (e.g., version parsing, update logic), add a `tests/` directory and use `pytest` (backend) or Vitest (frontend). Tests are a strong signal in a PR review.

## Reporting Bugs

Open an issue with:

1. **Title** following the commit prefix convention: `Fix: Frontend update fails with EXDEV on Docker Desktop`.
2. **Environment:** OS, Docker version, Python/Node version, browser (if frontend).
3. **Steps to reproduce** — numbered, minimal.
4. **Expected behaviour** vs. **actual behaviour**.
5. **Logs** — the relevant slice of `docker compose logs`, browser console, or traceback. Paste text, not screenshots, so it's searchable.

## Reporting Security Issues

**Do not open a public issue for security vulnerabilities.** Email the maintainers directly at [moeez.raza.dev@gmail.com](mailto:moeez.raza.dev@gmail.com) with:

- A description of the vulnerability.
- Steps to reproduce.
- Potential impact (data exposure, remote code execution, etc.).

You will receive an acknowledgement within 48 hours. Responsible disclosure is expected — please allow a fix to ship before publishing details.

## License

By contributing, you agree that your contributions will be licensed under the **MIT License** (see [LICENSE.md](LICENSE.md)). Your name will be added to the contributors list in the repository.

---

**Thank you for contributing to OBMMS.** Every improvement — from a typo fix to a new feature — helps the schools and organizations who depend on this software to keep their students and staff safe.
