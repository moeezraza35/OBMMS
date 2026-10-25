import os
import sys
import json
import re
import shutil
import tempfile
import asyncio
import logging
import urllib.request
import urllib.error
import zipfile
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from obmms import settings

logger = logging.getLogger("obmms.updater")

def parse_version_tuple(tag: str) -> Tuple[int, ...]:
    """
    Extracts numerical version tuple from tag string.
    e.g. 'backend-v0.0.2' -> (0, 0, 2)
         'backend-1.2.0'  -> (1, 2, 0)
         'v0.0.1'         -> (0, 0, 1)
    """
    # Remove module prefix (e.g., 'backend-v', 'backend-', 'v')
    cleaned = re.sub(r'^[a-zA-Z_\-]+v?', '', tag.strip())
    match = re.search(r'(\d+(?:\.\d+)+)', cleaned)
    if not match:
        return (0, 0, 0)
    version_part = match.group(1)
    try:
        return tuple(int(x) for x in version_part.split('.'))
    except ValueError:
        return (0, 0, 0)

def compare_versions(v1: str, v2: str) -> int:
    """
    Returns:
       1 if v1 > v2
      -1 if v1 < v2
       0 if v1 == v2
    """
    t1 = parse_version_tuple(v1)
    t2 = parse_version_tuple(v2)
    
    # Pad to equal length
    max_len = max(len(t1), len(t2))
    t1_padded = t1 + (0,) * (max_len - len(t1))
    t2_padded = t2 + (0,) * (max_len - len(t2))
    
    if t1_padded > t2_padded:
        return 1
    elif t1_padded < t2_padded:
        return -1
    return 0

def fetch_github_releases(repo: Optional[str] = None, token: Optional[str] = None) -> list[Dict[str, Any]]:
    """
    Fetches all releases for the specified GitHub repository.
    """
    target_repo = repo or settings.GITHUB_REPO
    url = f"https://api.github.com/repos/{target_repo}/releases"
    headers = {
        "User-Agent": "OBMMS-Updater",
        "Accept": "application/vnd.github.v3+json"
    }
    github_token = token or settings.GITHUB_TOKEN
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode("utf-8")
            return json.loads(data)
    except urllib.error.HTTPError as e:
        logger.error(f"GitHub API HTTP error ({e.code}): {e.reason}")
        return []
    except Exception as e:
        logger.error(f"Failed to fetch GitHub releases: {e}")
        return []

def get_latest_backend_release() -> Optional[Dict[str, Any]]:
    """
    Finds the latest release with tag prefix 'backend-'
    """
    releases = fetch_github_releases()
    backend_releases = [
        r for r in releases
        if r.get("tag_name", "").lower().startswith("backend-")
    ]
    if not backend_releases:
        return None

    # Sort descending by semver
    backend_releases.sort(
        key=lambda r: parse_version_tuple(r.get("tag_name", "")),
        reverse=True
    )
    return backend_releases[0]

def check_for_backend_update() -> Dict[str, Any]:
    """
    Checks if a newer backend version is available on GitHub Releases.
    """
    current_ver = getattr(settings, "VERSION", "0.0.1")
    latest_release = get_latest_backend_release()

    if not latest_release:
        return {
            "has_update": False,
            "current_version": current_ver,
            "latest_version": None,
            "release": None
        }

    latest_tag = latest_release.get("tag_name", "")
    has_update = compare_versions(latest_tag, current_ver) > 0

    return {
        "has_update": has_update,
        "current_version": current_ver,
        "latest_version": latest_tag,
        "release": latest_release
    }

def download_file(url: str, dest_path: str, token: Optional[str] = None):
    """
    Downloads file from URL to dest_path with optional GitHub auth token.
    """
    headers = {
        "User-Agent": "OBMMS-Updater",
        "Accept": "application/octet-stream"
    }
    github_token = token or settings.GITHUB_TOKEN
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest_path, "wb") as f:
        shutil.copyfileobj(resp, f)

def apply_backend_update(release: Dict[str, Any], backend_root: Optional[str] = None) -> bool:
    """
    Downloads release zip, extracts and updates backend files safely.
    Preserves .env, database files, venv, and user data.
    """
    if not backend_root:
        # Default to current backend directory (where main.py is located)
        backend_root = str(Path(__file__).resolve().parent.parent)

    backend_path = Path(backend_root).resolve()
    logger.info(f"Starting backend update for release {release.get('tag_name')} in {backend_path}...")

    # Look for zip asset in release, or fallback to zipball_url
    assets = release.get("assets", [])
    download_url = None

    # Prefer assets named backend*.zip or *.zip
    for asset in assets:
        name = asset.get("name", "").lower()
        if name.endswith(".zip") and "backend" in name:
            download_url = asset.get("browser_download_url")
            break

    if not download_url:
        for asset in assets:
            if asset.get("name", "").lower().endswith(".zip"):
                download_url = asset.get("browser_download_url")
                break

    if not download_url:
        download_url = release.get("zipball_url")

    if not download_url:
        logger.error("No valid download URL found for release.")
        return False

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_zip = os.path.join(tmpdir, "update.zip")
        extract_dir = os.path.join(tmpdir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)

        logger.info(f"Downloading update from {download_url}...")
        try:
            download_file(download_url, tmp_zip)
        except Exception as e:
            logger.error(f"Failed to download release zip: {e}")
            return False

        logger.info("Extracting update archive...")
        try:
            with zipfile.ZipFile(tmp_zip, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
        except Exception as e:
            logger.error(f"Failed to unzip update: {e}")
            return False

        # Locate source files in extracted archive
        # If it's a GitHub zipball, the root has a top-level folder like `moeezraza35-OBMMS-123456/`
        extracted_items = list(Path(extract_dir).iterdir())
        source_root = Path(extract_dir)
        if len(extracted_items) == 1 and extracted_items[0].is_dir():
            source_root = extracted_items[0]

        # Check if archive contains a backend subdirectory
        if (source_root / "backend").is_dir():
            source_backend = source_root / "backend"
        else:
            source_backend = source_root

        # Protected files / directories that must never be overwritten
        protected_items = {
            ".env",
            "venv",
            ".venv",
            "env",
            "__pycache__",
            ".git",
            "static/uploads",
            "uploads"
        }

        # Protected file extensions (e.g. SQLite databases, logs)
        protected_exts = {".sqlite", ".sqlite3", ".db", ".log"}

        logger.info("Applying updated files to backend directory...")
        for root, dirs, files in os.walk(source_backend):
            rel_dir = os.path.relpath(root, source_backend)
            target_dir = backend_path if rel_dir == "." else backend_path / rel_dir

            # Filter out protected directories
            dirs[:] = [
                d for d in dirs
                if d not in protected_items
                and (backend_path / rel_dir / d).name not in protected_items
            ]

            target_dir.mkdir(parents=True, exist_ok=True)

            for file in files:
                rel_file_path = os.path.normpath(os.path.join(rel_dir, file))
                
                # Check protected items
                if rel_file_path in protected_items or file in protected_items:
                    continue

                # Check extension protection
                _, ext = os.path.splitext(file)
                if ext.lower() in protected_exts:
                    continue

                src_file = Path(root) / file
                dst_file = target_dir / file

                try:
                    shutil.copy2(src_file, dst_file)
                except Exception as e:
                    logger.warning(f"Could not copy {src_file} to {dst_file}: {e}")

        # Update VERSION in settings.py or create a version stamp
        new_tag = release.get("tag_name", "")
        clean_new_ver = re.sub(r'^[a-zA-Z_\-]+v?', '', new_tag)
        try:
            settings_path = backend_path / "obmms" / "settings.py"
            if settings_path.exists():
                content = settings_path.read_text(encoding="utf-8")
                updated_content = re.sub(
                    r'VERSION\s*=\s*os\.getenv\("VERSION",\s*"[^"]*"\)',
                    f'VERSION = os.getenv("VERSION", "{clean_new_ver}")',
                    content
                )
                settings_path.write_text(updated_content, encoding="utf-8")
        except Exception as e:
            logger.warning(f"Could not update VERSION in settings.py: {e}")

        logger.info(f"Backend successfully updated to {new_tag}!")
        return True

def trigger_restart():
    """
    Triggers server reload or restart.
    - If running under uvicorn reload, touching main.py signals reload.
    - If running under systemd/Docker, we can touch main.py or re-exec.
    """
    logger.info("Triggering application reload...")
    main_py = Path(__file__).resolve().parent.parent / "main.py"
    if main_py.exists():
        try:
            # Update mtime to trigger uvicorn reload
            os.utime(main_py, None)
            logger.info("Touched main.py to trigger reload.")
        except Exception as e:
            logger.warning(f"Failed to touch main.py: {e}")

    # If running as standalone script or container without auto-reload,
    # we can restart using execv
    if not getattr(settings, "RELOAD", True):
        try:
            logger.info("Restarting process with os.execv...")
            os.execv(sys.executable, [sys.executable] + sys.argv)
        except Exception as e:
            logger.warning(f"os.execv failed: {e}")

async def auto_update_loop(app: Any):
    """
    Background worker loop checking for GitHub releases periodically.
    """
    # Wait 10 seconds after server startup before first check
    await asyncio.sleep(10)

    while True:
        try:
            if getattr(app.settings, "AUTO_UPDATE", False):
                logger.info("Checking for backend updates on GitHub Releases...")
                update_info = check_for_backend_update()
                if update_info.get("has_update"):
                    release = update_info.get("release")
                    logger.info(f"New backend release found: {release.get('tag_name')}! Auto-updating...")
                    success = apply_backend_update(release)
                    if success:
                        trigger_restart()
                        break
                else:
                    logger.info(f"OBMMS Backend is up to date (v{update_info.get('current_version')}).")
        except Exception as e:
            logger.error(f"Error in auto-update worker: {e}")

        # Sleep for the configured interval (default: 86400s / 24h)
        interval = getattr(settings, "UPDATE_CHECK_INTERVAL", 86400)
        await asyncio.sleep(interval)

from fastapi import APIRouter, BackgroundTasks

update_router = APIRouter(prefix="/api/system", tags=["System Update"])

@update_router.get("/updates")
async def get_system_updates():
    releases = fetch_github_releases()

    # Backend
    backend_current = getattr(settings, "VERSION", "0.0.2")
    backend_releases = [r for r in releases if r.get("tag_name", "").lower().startswith("backend-")]
    latest_backend = None
    has_backend_update = False
    if backend_releases:
        backend_releases.sort(key=lambda r: parse_version_tuple(r.get("tag_name", "")), reverse=True)
        latest_backend = backend_releases[0]
        has_backend_update = compare_versions(latest_backend.get("tag_name", ""), backend_current) > 0

    # Frontend
    frontend_releases = [r for r in releases if r.get("tag_name", "").lower().startswith("frontend-")]
    latest_frontend = None
    if frontend_releases:
        frontend_releases.sort(key=lambda r: parse_version_tuple(r.get("tag_name", "")), reverse=True)
        latest_frontend = frontend_releases[0]

    # Mobile
    mobile_releases = [r for r in releases if r.get("tag_name", "").lower().startswith("mobile-")]
    latest_mobile = None
    if mobile_releases:
        mobile_releases.sort(key=lambda r: parse_version_tuple(r.get("tag_name", "")), reverse=True)
        latest_mobile = mobile_releases[0]

    return {
        "auto_update": getattr(settings, "AUTO_UPDATE", False),
        "backend": {
            "current_version": backend_current,
            "has_update": has_backend_update,
            "latest_tag": latest_backend.get("tag_name") if latest_backend else None,
            "release_notes": latest_backend.get("body") if latest_backend else None,
            "published_at": latest_backend.get("published_at") if latest_backend else None,
        },
        "frontend": {
            "latest_tag": latest_frontend.get("tag_name") if latest_frontend else None,
            "release_notes": latest_frontend.get("body") if latest_frontend else None,
            "published_at": latest_frontend.get("published_at") if latest_frontend else None,
        },
        "mobile": {
            "latest_tag": latest_mobile.get("tag_name") if latest_mobile else None,
            "release_notes": latest_mobile.get("body") if latest_mobile else None,
            "published_at": latest_mobile.get("published_at") if latest_mobile else None,
            "assets": [
                {
                    "name": a.get("name"),
                    "size": a.get("size"),
                    "download_url": a.get("browser_download_url")
                }
                for a in (latest_mobile.get("assets", []) if latest_mobile else [])
            ]
        }
    }

@update_router.post("/update/backend")
async def trigger_backend_update(background_tasks: BackgroundTasks):
    update_info = check_for_backend_update()
    if not update_info.get("has_update"):
        return {
            "status": "info",
            "message": f"OBMMS Backend is already up to date ({update_info.get('current_version')}).",
            "has_update": False
        }

    release = update_info.get("release")

    def run_update_task():
        if apply_backend_update(release):
            trigger_restart()

    background_tasks.add_task(run_update_task)
    return {
        "status": "success",
        "message": f"Updating backend to {release.get('tag_name')} in background. Server will restart shortly.",
        "release": release.get("tag_name")
    }

@update_router.post("/auto-update/toggle")
async def toggle_auto_update(enable: bool):
    settings.AUTO_UPDATE = enable
    return {"status": "success", "auto_update": settings.AUTO_UPDATE}

