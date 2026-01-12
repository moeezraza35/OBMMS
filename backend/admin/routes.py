from fastapi import APIRouter, Request, HTTPException, status
from obmms.database import get_session
from auth.models import Users, Group
from auth.helper import authenticate, authorize, require_auth
from admin.helper import save, allowedModels, assignGroup

router = APIRouter(
  prefix="/api/admin",
  tags=["Administration", "Admin site"]
)

# Reading Routes

@router.get("/models/")
async def get_allowed_models(request:Request) -> dict:
  models = ["users", "group"]
  session = get_session()
  user = authenticate(request, session)
  if user is None:
    session.close()
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Login Required"
    )
  if user.is_admin: #type: ignore
    session.close()
    return {
      "models" : models
    }
  allowed_models = allowedModels(session, user)
  session.close()
  return {
    "models" : allowed_models
  }

@router.get("/users/all/")
async def get_all_users(request:Request) -> dict:
  session = get_session()
  user = authenticate(request, session)
  if user is None:
    session.close()
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Login required"
    )
  if not authorize(user, session, "users"):
    session.close()
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN
    )
  result = {
    "users" : []
  }
  users = session.query(Users).all()
  for record in users:
    result["users"].append(record.serialize())
  session.close()
  return result

@router.get("/group/all/")
async def get_all_groups(request:Request) -> dict:
  session = get_session()
  user = authenticate(request, session)
  if user is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Login Required"
    )
  result = {
    "groups" : []
  }
  groups = session.query(Group).all()
  for group in groups:
    result["groups"].append(group.serialize())
  if not authorize(user, session, "group"):
    if not authorize(user, session, "users"):
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not Allowed"
      )
    for group in result["groups"]:
      del group["permissions"]
  session.close()
  return result

# Adding Routes

@router.post("/users/add/")
async def add_user(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "user", False)
    if data["id"] == "":
      new_user = Users()
    else:
      existing_user = session.get(Users, data["id"])
      if existing_user is not None:
        raise HTTPException(
          status_code=status.HTTP_409_CONFLICT,
          detail="ID Exists"
        )
      new_user = Users(id=data["id"])
    assignGroup(user, new_user, data["group"])
    if not "name" in data or data["name"] == "":
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Data"
      )
    new_user.name = data["name"]
    new_user.reset_required = True  # type:ignore
    new_user.active = True # type: ignore
    save(session, new_user)
    return {
      "user": new_user.serialize()
    }
  finally:
    session.close()

@router.post("/group/add/")
async def add_group(request:Request) -> dict:
  data:dict = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "group", False)
    if data["id"] == "":
      group = Group()
    else:
      existing_group = session.get(Group, data["id"])
      if existing_group is not None:
        raise HTTPException(
          status_code=status.HTTP_409_CONFLICT,
          detail="ID Exists"
        )
      group = Group(id=data["id"])
    if not "name" in data or data["name"] == "":
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Data"
      )
    group.name = data["name"]
    permissions:dict = {}
    for key, value in data.items():
      if not key in ["id", "name"] and value:
        permissions[key] = value
    group.permissions = str(permissions)  # type: ignore
    save(session, group)
    return {
      "group" : group.serialize()
    }
  finally:
    session.close()

# Updating Routes

@router.post("/users/update/")
async def update_user(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "user", False)
    edit_user = session.get(Users, data["id"])
    if edit_user is None:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Not Exists"
      )
    edit_user.is_admin = None # type:ignore
    edit_user.group = None  # type:ignore
    assignGroup(user, edit_user, data["group"])
    if data["password"] != "":
      edit_user.password = data["password"]
      edit_user.reset_required = True # type:ignore
    if not "name" in data or data["name"] == "":
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Data"
      )
    edit_user.name = data["name"]
    save(session, edit_user)
    return {
      "user": edit_user.serialize()
    }
  finally:
    session.close()

@router.post("/group/update/")
async def update_group(request:Request) -> dict:
  data:dict = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "group", False)
    group = session.get(Group, data["id"])
    if group is None:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Not Exists"
      )
    if not "name" in data or data["name"] == "":
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid Data"
      )
    group.name = data["name"]
    permissions:dict = {}
    for key, value in data.items():
      if not key in ["id", "name"] and value:
        permissions[key] = value
    group.permissions = str(permissions)  # type: ignore
    save(session, group)
    return {
      "group": group.serialize()
    }
  finally:
    session.close()
