# Online Bus Monitoring & Management System
Detail docs on it
## Update Manager
### Architecture
```
                      GitHub Releases (moeezraza35/OBMMS)
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │ (backend-v*)               │ (frontend-v*)              │ (mobile-v* / mobile-*)
         ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ FastAPI Backend  │         │ Vite.js Frontend │         │  React Native    │
│                  │         │                  │         │  Mobile App      │
│ Checks GitHub    │         │ Checks GitHub    │         │ Checks GitHub    │
│ if AUTO_UPDATE   │         │ Alerts client of │         │ Shows Alert:     │
│ Downloads zip &  │         │ new version with │         │ - Cancel: Ignore │
│ safely replaces  │         │ Update / Reload  │         │ - OK: Ask perm,  │
│ backend files    │         │ banner           │         │   download .apk  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```
### 1. FastAPI Application (Backend Auto-Updater)
#### How it works:
1. Setting Control: Configured in [settings.py](../backend/obmms/settings.py) and `.env`:
    - `app.settings.AUTO_UPDATE`: If `True`, enables automatic background updates.
    - `app.settings.VERSION`: Current installed backend version.
    - `app.settings.GITHUB_REPO`: `moeezraza35/OBMMS`.
    - `app.settings.UPDATE_CHECK_INTERVAL`: Frequency of update checks (default: 24h).
2. Update Engine [updater.py](../backend/obmms/updater.py):
    - Queries `https://api.github.com/repos/moeezraza35/OBMMS/releases`.
    - Filters for releases with tag prefix `backend-` (e.g. `backend-v0.0.2`, `backend-v0.0.3`).
    - Compares semver against `app.settings.VERSION`.
    - When a newer version is released:
        - Downloads the release zip archive (from attached `backend.zip` asset or GitHub zipball_url).
        - Extracts and updates the application files safely into the backend directory.
        - Safety preservation: Strictly preserves `.env` (database credentials & secrets), `venv/`, SQLite/database files, and user uploads.
        - **Reload:** Touches [main.py](../backend/main.py) to trigger uvicorn reload (or re-executes process if running under systemd/Docker).
2. Background Worker & API Endpoints:
    - Background worker starts automatically in `OBMMS.__init__` when `app.settings.AUTO_UPDATE == True`.
    - Added REST endpoints under `/api/system`:
        - `GET /api/system/updates`: Returns update status across Backend, Frontend, and Mobile.
        - `POST /api/system/update/backend`: Allows triggering a backend update on demand.
        - `POST /api/system/auto-update/toggle?enable=true|false`: Dynamically toggles auto-update.
### 2. Vite.JS + React.JS (Frontend Update Manager)
#### How it works:
1. Version & Config (config.jsx):
    - Set to `version = "0.0.2"`, `github_repo = "moeezraza35/OBMMS"`.
2. Update Checker (updateManager.js):
    - Queries GitHub releases for tags matching `frontend-` (e.g. `frontend-v0.0.2`, `frontend-v0.0.3`).
    - Performs semver comparison.
    - Provides `applyFrontendUpdate()` which busts browser cache and reloads the web application.
3. UI Notifier [UpdateNotifier.jsx](../frontend/src/components/UpdateNotifier.jsx):
    - Mounted in [App.jsx](../frontend/src/App.jsx).
    - When an update is detected, displays a notification badge:
    - **"Update Now"**: Clears cache and instantly reloads the web app to load the new version.
    - **"Later"**: Dismisses the notification for the current session.
### 3. React Native Mobile Application (Android APK & iOS)
#### How it works:
1. GitHub Release Filtering:
    - Filters for releases starting with mobile- (e.g. mobile-0.0.2 or mobile-v0.0.2).
2. Prompt Dialog:
    - On app startup ([App.tsx](../mobile/obmms/App.tsx)), [updateManager.ts](../mobile/obmms/src/utils/updateManager.ts) queries GitHub.
    - If an update is available, displays a native alert:
        - **"Cancel"**: Cancels the update and closes the dialog.
        - **"OK"**: Proceeds with the download and install flow.
3. Android APK Download & Native Installer:
    - **Permission Check:** Checks `REQUEST_INSTALL_PACKAGES` (required on Android 8+). If not granted, prompts the user to open settings (`openInstallPermissionSettings()`).
    - **Background Download:** Uses Android's native `DownloadManager` via [AppUpdateModule.kt](../mobile/obmms/android/app/src/main/java/dev/moeezraza/obmms/AppUpdateModule.kt). Shows a download progress notification in the Android system drawer.
    - **Automatic Install:** When finished, creates an Intent.`ACTION_VIEW` with `application/vnd.android.package-archive` and the secure `FileProvider` URI ([AndroidManifest.xml](../mobile/obmms/android/app/src/main/AndroidManifest.xml) & [file_paths.xml](../mobile/obmms)). The native Android update installer opens directly.
4. iOS Support:
    - Direct APK/IPA sideloading is disallowed by iOS security policies. On iOS devices, the updater opens the release URL, `TestFlight` invitation, or App Store link.
### 4. GitHub Actions CI/CD Monorepo Workflow

To automate publishing release files whenever you push a tag, .github/workflows/release.yml has been created:

| Tag Pushed | Action Taken by GitHub Workflow |
| ---------- | ------------------------------- |
| `backend-v0.0.3` | Bundles `backend/` into `backend.zip` (excluding `.env`, `venv/`, `db`) and publishes to release.
`frontend-v0.0.3` | Runs npm run build in frontend/, bundles dist/ into frontend-dist.zip, and attaches to release.
`mobile-v0.0.2` | Runs ./gradlew assembleRelease in mobile/obmms/android, attaches obmms.apk to release.

### How to Release an Update

When you want to publish an update for any module, simply create and push a git tag:

#### For Backend:
```bash
git tag backend-v0.0.3
git push origin backend-v0.0.3
```
If `AUTO_UPDATE = True`, running FastAPI servers will detect the release, download `backend.zip`, extract, and restart automatically.
#### For Frontend:
```bash
git tag frontend-v0.0.3
git push origin frontend-v0.0.3
```
Users visiting the frontend will see the update banner asking them to reload for the latest version.
#### For Mobile:
```bash
git tag mobile-v0.0.2
git push origin mobile-v0.0.2
```
Users opening the mobile app will be prompted with an alert. Tapping OK downloads obmms.apk and initiates the Android installer.