from fastapi import APIRouter, BackgroundTasks

from .helpers import (
    apply_backend_update,
    check_for_backend_update,
    compare_versions,
    fetch_github_releases,
    parse_version_tuple,
    trigger_restart,
)
from obmms import settings

update_router = APIRouter(prefix="/api/system", tags=["System Update"])

@update_router.get("/updates")
async def get_system_updates():
    releases = fetch_github_releases()

    backend_current = getattr(settings, "VERSION", "0.0.2")
    backend_releases = [r for r in releases if r.get("tag_name", "").lower().startswith("backend-")]
    latest_backend = None
    has_backend_update = False
    if backend_releases:
        backend_releases.sort(key=lambda r: parse_version_tuple(r.get("tag_name", "")), reverse=True)
        latest_backend = backend_releases[0]
        has_backend_update = compare_versions(latest_backend.get("tag_name", ""), backend_current) > 0

    frontend_releases = [r for r in releases if r.get("tag_name", "").lower().startswith("frontend-")]
    latest_frontend = None
    if frontend_releases:
        frontend_releases.sort(key=lambda r: parse_version_tuple(r.get("tag_name", "")), reverse=True)
        latest_frontend = frontend_releases[0]

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
    if not isinstance(release, dict):
        return {
            "status": "error",
            "message": "Update information is invalid. Please check for updates again.",
            "has_update": False
        }

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