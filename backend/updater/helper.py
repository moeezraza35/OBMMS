import json
import logging
import re
import shutil
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path

logger = logging.getLogger("obmms.updater.helper")

def parse_version_tuple(tag: Any) -> Tuple[int, ...]:
    """
    Extracts numerical version tuple from tag string.
    'backend-v0.0.2' -> (0, 0, 2)
    'v0.0.1'         -> (0, 0, 1)
    None / garbage   -> (0, 0, 0)
    """
    safe_tag = tag.strip() if isinstance(tag, str) else ""
    cleaned = re.sub(r'^[a-zA-Z_\-]+v?', '', safe_tag)
    match = re.search(r'(\d+(?:\.\d+)+)', cleaned)
    if not match:
        return (0, 0, 0)
    try:
        return tuple(int(x) for x in match.group(1).split('.'))
    except ValueError:
        return (0, 0, 0)


def compare_versions(v1: Any, v2: Any) -> int:
    """1 if v1 > v2, -1 if v1 < v2, 0 if equal."""
    t1 = parse_version_tuple(v1)
    t2 = parse_version_tuple(v2)
    max_len = max(len(t1), len(t2))
    t1_padded = t1 + (0,) * (max_len - len(t1))
    t2_padded = t2 + (0,) * (max_len - len(t2))
    if t1_padded > t2_padded:
        return 1
    if t1_padded < t2_padded:
        return -1
    return 0


def clean_version_from_tag(tag: str) -> str:
    """'backend-v0.1.0' -> '0.1.0'"""
    return re.sub(r'^[a-zA-Z_\-]+v?', '', tag or "").strip()


def filter_releases_by_prefix(releases: List[Dict[str, Any]], prefix: str) -> List[Dict[str, Any]]:
    p = prefix.lower()
    return [r for r in releases if str(r.get("tag_name", "")).lower().startswith(p)]


def sort_releases_desc(releases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(releases, key=lambda r: parse_version_tuple(r.get("tag_name", "")), reverse=True)


def fetch_github_releases(
    repo: str,
    token: Optional[str] = None,
    timeout: int = 15,
) -> List[Dict[str, Any]]:
    url = f"https://api.github.com/repos/{repo}/releases"
    headers = {
        "User-Agent": "OBMMS-Updater",
        "Accept": "application/vnd.github.v3+json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        logger.error(f"GitHub API HTTP error ({e.code}): {e.reason}")
        return []
    except Exception as e:
        logger.error(f"Failed to fetch GitHub releases: {e}")
        return []


def download_file(
    url: str,
    dest_path: str,
    token: Optional[str] = None,
    timeout: int = 60,
) -> None:
    headers = {
        "User-Agent": "OBMMS-Updater",
        "Accept": "application/octet-stream",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp, open(dest_path, "wb") as f:
        shutil.copyfileobj(resp, f)


def find_backend_zip_asset(release: Dict[str, Any]) -> Optional[str]:
    """Pick the best zip download URL from a release payload."""
    assets = release.get("assets") or []
    # Prefer a zip whose name mentions "backend"
    for asset in assets:
        name = str(asset.get("name", "")).lower()
        if name.endswith(".zip") and "backend" in name:
            return asset.get("browser_download_url")
    # Any zip
    for asset in assets:
        if str(asset.get("name", "")).lower().endswith(".zip"):
            return asset.get("browser_download_url")
    # GitHub auto-generated zipball
    return release.get("zipball_url")

def find_frontend_zip_asset(release: Dict[str, Any]) -> Optional[str]:
    """
    Pick the dist.zip / frontend bundle download URL from a frontend release payload.
    Prefers exact 'dist.zip', 'frontend-dist.zip', 'frontend.zip';
    falls back to any zip whose name contains 'dist' or 'frontend',
    or any zip asset attached to the release.
    Does NOT fall back to zipball_url — the zipball is source, not a build.
    """
    assets = release.get("assets") or []
    exact_names = {"dist.zip", "frontend-dist.zip", "frontend.zip"}
    for asset in assets:
        name = str(asset.get("name", "")).lower()
        if name in exact_names:
            return asset.get("browser_download_url")
    for asset in assets:
        name = str(asset.get("name", "")).lower()
        if name.endswith(".zip") and ("dist" in name or "frontend" in name):
            return asset.get("browser_download_url")
    for asset in assets:
        name = str(asset.get("name", "")).lower()
        if name.endswith(".zip"):
            return asset.get("browser_download_url")
    return None

def locate_dist_root(extract_dir: Path) -> Optional[Path]:
    """
    Find the directory containing index.html inside an extracted dist.zip.
    Handles:
      - index.html at root
      - dist/index.html
      - templates/index.html
      - wrapper/dist/index.html or arbitrary nested directory
    """
    if (extract_dir / "index.html").exists():
        return extract_dir
    if (extract_dir / "dist" / "index.html").exists():
        return extract_dir / "dist"
    if (extract_dir / "templates" / "index.html").exists():
        return extract_dir

    matches = list(extract_dir.glob("**/index.html"))
    if matches:
        candidate = matches[0].parent
        if candidate.name == "templates" and (candidate.parent / "static").is_dir():
            return candidate.parent
        return candidate
    return None