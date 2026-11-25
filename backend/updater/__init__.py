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
  find_frontend_zip_asset,
  locate_dist_root,
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

    installed_fe = self._read_installed_frontend_version()
    has_frontend_update = bool(lf) and (
      installed_fe is None or compare_versions(lf.get("tag_name", ""), installed_fe) > 0
    )

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
        "current_version": installed_fe,
        "has_update": has_frontend_update,
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

  # ---------- Frontend: queries ----------

  def get_latest_frontend_release(self) -> Optional[Dict[str, Any]]:
    releases = filter_releases_by_prefix(self.get_releases(), "frontend-")
    return sort_releases_desc(releases)[0] if releases else None

  def _frontend_version_stamp_path(self) -> Path:
    # Stored outside static/, so it's not served to clients and not wiped by the swap.
    return Path(self.backend_root) / ".frontend_version"

  def _read_installed_frontend_version(self) -> Optional[str]:
    p = self._frontend_version_stamp_path()
    if not p.exists():
      return None
    try:
      return p.read_text(encoding="utf-8").strip() or None
    except Exception:
      return None

  def _write_installed_frontend_version(self, tag: str) -> None:
    p = self._frontend_version_stamp_path()
    try:
      p.parent.mkdir(parents=True, exist_ok=True)
      p.write_text(tag, encoding="utf-8")
    except Exception as e:
      logger.warning(f"Could not write frontend version stamp: {e}")

  def check_for_frontend_update(self) -> Dict[str, Any]:
    latest = self.get_latest_frontend_release()
    installed = self._read_installed_frontend_version()
    if not latest:
      return {
        "has_update": False,
        "current_version": installed,
        "latest_version": None,
        "release": None,
      }
    tag = latest.get("tag_name", "")
    # First-ever update: no stamp → treat as out-of-date and apply.
    has_update = installed is None or compare_versions(tag, installed) > 0
    return {
      "has_update": has_update,
      "current_version": installed,
      "latest_version": tag,
      "release": latest,
    }

  # ---------- Frontend: apply ----------

  def apply_frontend_update(
    self,
    release: Dict[str, Any],
    templates_root: Optional[str] = None,
    static_root: Optional[str] = None,
  ) -> bool:
    """
    Downloads frontend bundle (dist.zip), extracts into staging directories,
    then safely deploys:
    - dist/index.html            → <backend_root>/templates/index.html
    - everything else in dist/   → <backend_root>/static/...
    Preserves <static>/uploads if present (user data lives outside the update).
    Uses atomic file replacement within directories to avoid cross-device link
    (EXDEV: [Errno 18]) errors in Docker overlayfs and mounted filesystems.
    """
    backend_path = Path(self.backend_root).resolve()
    templates_path = Path(templates_root).resolve() if templates_root else backend_path / "templates"
    static_path = Path(static_root).resolve() if static_root else backend_path / "static"

    tag = release.get("tag_name", "")
    logger.info(f"Starting frontend update to {tag} (templates={templates_path}, static={static_path})")

    download_url = find_frontend_zip_asset(release)
    if not download_url:
      logger.error("No frontend bundle zip asset found in release; aborting frontend update.")
      return False

    with tempfile.TemporaryDirectory() as tmpdir:
      tmp_zip = os.path.join(tmpdir, "dist.zip")
      extract_dir = Path(tmpdir) / "extracted"
      extract_dir.mkdir(parents=True, exist_ok=True)

      try:
        download_file(download_url, tmp_zip, self.token)
      except Exception as e:
        logger.error(f"Failed to download frontend zip: {e}")
        return False

      try:
        with zipfile.ZipFile(tmp_zip, "r") as zf:
          zf.extractall(extract_dir)
      except Exception as e:
        logger.error(f"Failed to unzip frontend zip: {e}")
        return False

      source_root = locate_dist_root(extract_dir)
      if source_root is None:
        logger.error("dist.zip has no index.html at a recognizable path; aborting.")
        return False

      # Check if source is arranged as templates/ + static/ OR flat dist/
      if (source_root / "templates" / "index.html").exists() and (source_root / "static").is_dir():
        index_source = source_root / "templates" / "index.html"
        static_source = source_root / "static"
      else:
        index_source = source_root / "index.html"
        static_source = source_root

      # 1) index.html → templates/index.html (atomic file replacement)
      templates_path.mkdir(parents=True, exist_ok=True)
      tmp_index = templates_path / ".index.html.tmp"
      shutil.copy2(index_source, tmp_index)
      os.replace(tmp_index, templates_path / "index.html")

      # 2) Sync static files → static/
      # Strictly protect user uploads
      protected_items = {"uploads"}
      static_path.mkdir(parents=True, exist_ok=True)

      for entry in static_source.iterdir():
        if entry.name in ("index.html", "templates") or entry.name in protected_items:
          continue
        dest = static_path / entry.name
        if entry.is_dir():
          # For Vite bundled assets, clean stale hashed chunks from older builds
          clean_stale = (entry.name == "assets")
          self._sync_directory(entry, dest, clean_stale=clean_stale, preserve=protected_items)
        else:
          tmp_file = static_path / f".{entry.name}.tmp"
          shutil.copy2(entry, tmp_file)
          os.replace(tmp_file, dest)

      # 3) Cleanup any lingering .new / .old directories from previous failed attempts
      for p in (
        templates_path.parent / (templates_path.name + ".new"),
        templates_path.parent / (templates_path.name + ".old"),
        static_path.parent / (static_path.name + ".new"),
        static_path.parent / (static_path.name + ".old"),
      ):
        if p.exists():
          shutil.rmtree(p, ignore_errors=True)

      # 4) Record what we installed
      self._write_installed_frontend_version(tag)

      logger.info(f"Frontend successfully updated to {tag}.")
      return True

  @staticmethod
  def _sync_directory(
    src: Path,
    dst: Path,
    clean_stale: bool = False,
    preserve: Optional[set] = None,
  ) -> None:
    """
    Safely copies files from src into dst in-place.
    Uses atomic file replacement (os.replace on temporary files within the same directory),
    preventing partial reads while completely avoiding cross-device link (EXDEV) errors
    that happen when attempting to rename directories in Docker overlayfs or bind mounts.
    """
    preserve = preserve or set()
    dst.mkdir(parents=True, exist_ok=True)
    new_names = set()

    for item in src.iterdir():
      if item.name in preserve:
        continue
      new_names.add(item.name)
      target = dst / item.name
      if item.is_dir():
        Updater._sync_directory(item, target, clean_stale=clean_stale, preserve=preserve)
      else:
        tmp_target = dst / f".{item.name}.tmp"
        shutil.copy2(item, tmp_target)
        os.replace(tmp_target, target)

    if clean_stale:
      for existing in dst.iterdir():
        if existing.name in preserve or existing.name.startswith("."):
          continue
        if existing.name not in new_names:
          if existing.is_dir():
            shutil.rmtree(existing, ignore_errors=True)
          else:
            try:
              existing.unlink()
            except Exception as e:
              logger.warning(f"Could not remove stale file {existing}: {e}")


__all__ = ["Updater", "get_updater"]