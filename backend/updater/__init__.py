import asyncio
import logging
import os
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI

from obmms.settings import (
    AUTO_UPDATE,
    GITHUB_REPO,
    GITHUB_TOKEN,
    RELOAD,
    UPDATE_CHECK_INTERVAL,
    VERSION,
)

from .helper import (
    clean_version_from_tag,
    compare_versions,
    download_file,
    fetch_github_releases,
    filter_releases_by_prefix,
    find_backend_zip_asset,
    sort_releases_desc,
)

logger = logging.getLogger("obmms.updater")

_updater_instance: Optional["Updater"] = None


def get_updater() -> "Updater":
    """Return the singleton Updater. Raises if Updater(app) was never called."""
    if _updater_instance is None:
        raise RuntimeError(
            "Updater has not been initialized. Call Updater(app) in your main module."
        )
    return _updater_instance


class Updater:
    def __init__(
        self,
        app: FastAPI,
        repo: str = GITHUB_REPO,
        token: Optional[str] = GITHUB_TOKEN,
        version: str = VERSION,
        auto_update: bool = AUTO_UPDATE,
        reload: bool = RELOAD,
        check_interval: int = UPDATE_CHECK_INTERVAL,
        backend_root: Optional[str] = None,
    ):
        global _updater_instance
        # Idempotent: re-calling with the same app is a no-op (safe for tests / hot-reload).
        if _updater_instance is not None and _updater_instance.app is app:
            return

        _updater_instance = self

        self.app = app
        self.repo = repo
        self.token = token
        self.version = version
        self.auto_update = auto_update
        self.reload = reload
        self.check_interval = check_interval
        self.backend_root = backend_root or str(Path(__file__).resolve().parent.parent)
        self._loop_task: Optional[asyncio.Task] = None

        # Deferred import to avoid a circular import at module load time.
        from .routes import update_router
        app.include_router(update_router)
        app.on_event("startup")(self._on_startup)

    # ---------- Lifecycle ----------

    async def _on_startup(self) -> None:
        if self.auto_update and (self._loop_task is None or self._loop_task.done()):
            self._loop_task = asyncio.create_task(self.auto_update_loop())

    def set_auto_update(self, enable: bool) -> bool:
        self.auto_update = bool(enable)
        if self.auto_update and (self._loop_task is None or self._loop_task.done()):
            try:
                self._loop_task = asyncio.create_task(self.auto_update_loop())
            except RuntimeError as e:
                logger.warning(f"Cannot start update loop (no event loop): {e}")
        return self.auto_update

    # ---------- Queries ----------

    def get_releases(self) -> list:
        return fetch_github_releases(self.repo, self.token)

    def get_latest_backend_release(self) -> Optional[Dict[str, Any]]:
        releases = filter_releases_by_prefix(self.get_releases(), "backend-")
        return sort_releases_desc(releases)[0] if releases else None

    def check_for_backend_update(self) -> Dict[str, Any]:
        latest = self.get_latest_backend_release()
        if not latest:
            return {
                "has_update": False,
                "current_version": self.version,
                "latest_version": None,
                "release": None,
            }
        tag = latest.get("tag_name", "")
        return {
            "has_update": compare_versions(tag, self.version) > 0,
            "current_version": self.version,
            "latest_version": tag,
            "release": latest,
        }

    def get_system_updates(self) -> Dict[str, Any]:
        releases = self.get_releases()
        backend = sort_releases_desc(filter_releases_by_prefix(releases, "backend-"))
        frontend = sort_releases_desc(filter_releases_by_prefix(releases, "frontend-"))
        mobile = sort_releases_desc(filter_releases_by_prefix(releases, "mobile-"))

        lb = backend[0] if backend else None
        lf = frontend[0] if frontend else None
        lm = mobile[0] if mobile else None

        has_backend_update = bool(lb) and compare_versions(
            lb.get("tag_name", ""), self.version
        ) > 0

        return {
            "auto_update": self.auto_update,
            "backend": {
                "current_version": self.version,
                "has_update": has_backend_update,
                "latest_tag": lb.get("tag_name") if lb else None,
                "release_notes": lb.get("body") if lb else None,
                "published_at": lb.get("published_at") if lb else None,
            },
            "frontend": {
                "latest_tag": lf.get("tag_name") if lf else None,
                "release_notes": lf.get("body") if lf else None,
                "published_at": lf.get("published_at") if lf else None,
            },
            "mobile": {
                "latest_tag": lm.get("tag_name") if lm else None,
                "release_notes": lm.get("body") if lm else None,
                "published_at": lm.get("published_at") if lm else None,
                "assets": [
                    {
                        "name": a.get("name"),
                        "size": a.get("size"),
                        "download_url": a.get("browser_download_url"),
                    }
                    for a in (lm.get("assets", []) if lm else [])
                ],
            },
        }

    # ---------- Update application ----------

    def apply_backend_update(self, release: Dict[str, Any]) -> bool:
        backend_path = Path(self.backend_root).resolve()
        logger.info(f"Starting backend update to {release.get('tag_name')} in {backend_path}")

        download_url = find_backend_zip_asset(release)
        if not download_url:
            logger.error("No valid download URL found for release.")
            return False

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_zip = os.path.join(tmpdir, "update.zip")
            extract_dir = os.path.join(tmpdir, "extracted")
            os.makedirs(extract_dir, exist_ok=True)

            try:
                download_file(download_url, tmp_zip, self.token)
            except Exception as e:
                logger.error(f"Failed to download release zip: {e}")
                return False

            try:
                with zipfile.ZipFile(tmp_zip, "r") as zf:
                    zf.extractall(extract_dir)
            except Exception as e:
                logger.error(f"Failed to unzip update: {e}")
                return False

            source_root = Path(extract_dir)
            items = list(source_root.iterdir())
            if len(items) == 1 and items[0].is_dir():
                source_root = items[0]

            source_backend = (
                source_root / "backend" if (source_root / "backend").is_dir() else source_root
            )

            protected_dirs = {"venv", ".venv", "env", "__pycache__", ".git", "uploads"}
            protected_files = {".env"}
            protected_exts = {".sqlite", ".sqlite3", ".db", ".log"}

            logger.info("Applying updated files...")
            for root, dirs, files in os.walk(source_backend):
                rel_dir = os.path.relpath(root, source_backend)
                target_dir = backend_path if rel_dir == "." else backend_path / rel_dir
                dirs[:] = [d for d in dirs if d not in protected_dirs]
                target_dir.mkdir(parents=True, exist_ok=True)

                for name in files:
                    if name in protected_files:
                        continue
                    if os.path.splitext(name)[1].lower() in protected_exts:
                        continue
                    try:
                        shutil.copy2(Path(root) / name, target_dir / name)
                    except Exception as e:
                        logger.warning(f"Could not copy {root}/{name}: {e}")

            self._update_version_in_settings(release)
            logger.info(f"Backend updated to {release.get('tag_name')}.")
            return True

    def _update_version_in_settings(self, release: Dict[str, Any]) -> None:
        new_ver = clean_version_from_tag(release.get("tag_name", ""))
        settings_path = Path(self.backend_root) / "obmms" / "settings.py"
        if not settings_path.exists():
            return
        try:
            content = settings_path.read_text(encoding="utf-8")
            updated = re.sub(
                r'VERSION\s*=\s*os\.getenv\("VERSION",\s*"[^"]*"\)',
                f'VERSION = os.getenv("VERSION", "{new_ver}")',
                content,
            )
            settings_path.write_text(updated, encoding="utf-8")
            self.version = new_ver
        except Exception as e:
            logger.warning(f"Could not update VERSION in settings.py: {e}")

    def trigger_restart(self) -> None:
        logger.info("Triggering application reload...")
        main_py = Path(self.backend_root) / "main.py"

        # Under uvicorn --reload, touching the entry file is enough.
        if main_py.exists():
            try:
                os.utime(main_py, None)
                logger.info("Touched main.py to trigger reload.")
            except Exception as e:
                logger.warning(f"Failed to touch main.py: {e}")

        # Hard restart only when there is no external reloader.
        if not self.reload:
            try:
                logger.info("Restarting process with os.execv...")
                os.execv(sys.executable, [sys.executable] + sys.argv)
            except Exception as e:
                logger.warning(f"os.execv failed: {e}")

    # ---------- Background loop ----------

    async def auto_update_loop(self) -> None:
        # Small delay so the server is fully up before the first check.
        await asyncio.sleep(10)

        while self.auto_update:
            try:
                info = self.check_for_backend_update()
                release = info.get("release")
                if info.get("has_update") and isinstance(release, dict):
                    logger.info(f"New backend release: {release.get('tag_name')}. Updating...")
                    if self.apply_backend_update(release):
                        self.trigger_restart()
                        return  # process will restart; loop ends here
                else:
                    logger.info(f"Backend up to date (v{self.version}).")
            except Exception as e:
                logger.error(f"Error in auto-update worker: {e}")

            await asyncio.sleep(self.check_interval)

        logger.info("Auto-update loop exited (auto_update disabled).")


__all__ = ["Updater", "get_updater"]