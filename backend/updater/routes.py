from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status

from auth.helper import authenticate
from auth.models import Users
from obmms.database import get_session
from . import get_updater

import logging

logger = logging.getLogger("obmms.updater.routes")

update_router = APIRouter(prefix="/api/system", tags=["System Update"])


def require_admin(request: Request) -> Users:
  """
  Verifies that the incoming request is authenticated and belongs to an admin user.
  Raises 401 if not logged in, or 403 if user is not an administrator.
  """
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if user.is_admin is not True:
      raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin privileges required")
    return user
  finally:
    session.close()


@update_router.get("/updates")
async def get_system_updates(user: Users = Depends(require_admin)):
  return get_updater().get_system_updates()


@update_router.post("/update/backend")
async def trigger_backend_update(
  background_tasks: BackgroundTasks,
  user: Users = Depends(require_admin),
):
  updater = get_updater()
  info = updater.check_for_backend_update()

  if not info.get("has_update"):
    return {
      "status": "info",
      "message": f"OBMMS Backend is already up to date ({info.get('current_version')}).",
      "has_update": False,
    }

  release = info.get("release")
  if not isinstance(release, dict):
    return {
      "status": "error",
      "message": "Update information is invalid. Please check for updates again.",
      "has_update": False,
    }

  def _run():
    if updater.apply_backend_update(release):
      updater.trigger_restart()

  background_tasks.add_task(_run)

  return {
    "status": "success",
    "message": (
      f"Updating backend to {release.get('tag_name')} in background. "
      "Server will restart shortly."
    ),
    "release": release.get("tag_name"),
  }


@update_router.post("/auto-update/toggle")
async def toggle_auto_update(
  enable: bool,
  user: Users = Depends(require_admin),
):
  return {"status": "success", "auto_update": get_updater().set_auto_update(enable)}


@update_router.post("/update/frontend")
async def trigger_frontend_update(
  background_tasks: BackgroundTasks,
  user: Users = Depends(require_admin),
):
  updater = get_updater()
  info = updater.check_for_frontend_update()

  if not info.get("has_update"):
    return {
      "status": "info",
      "message": f"OBMMS Frontend is already up to date ({info.get('current_version')}).",
      "has_update": False,
    }

  release = info.get("release")
  if not isinstance(release, dict):
    return {
      "status": "error",
      "message": "Update information is invalid. Please check for updates again.",
      "has_update": False,
    }

  def _run():
    if updater.apply_frontend_update(release):
      logger.info("Frontend update applied; clients should reload.")
      # No restart: files are swapped in place, next request picks them up.
    else:
      logger.error(f"Frontend update to {release.get('tag_name')} failed.")

  background_tasks.add_task(_run)

  return {
    "status": "success",
    "message": (
      f"Updating frontend to {release.get('tag_name')} in background. "
      "Reload the page after a few seconds."
    ),
    "release": release.get("tag_name"),
  }
