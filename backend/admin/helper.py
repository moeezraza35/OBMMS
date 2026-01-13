from fastapi import HTTPException, status
from sqlalchemy.orm import Session, DeclarativeBase
from auth.models import Users
from auth.helper import getPermissions

def save(session:Session, obj:DeclarativeBase):
  try:
    session.add(obj)
    session.commit()
    session.refresh(obj)
  except Exception as e:
    session.rollback()
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Database Error: "+str(e)
    )

def allowedModels(session:Session, user:Users) -> list[str]:
  models = ["users", "group"]
  if user.is_admin: # type:ignore
    return models
  permissions = getPermissions(user, session)
  allowed_models = []
  for model in models:
    if model in permissions:
      allowed_models.append(model)
  return allowed_models

def assignGroup(user:Users, edit_user:Users, group:str|int):
  if group == "Admin":
    if user.is_admin is True:
      edit_user.is_admin = True # type:ignore
      edit_user.group = None    # type:ignore
  else:
    if edit_user.is_admin is True and user.is_admin is True:
      edit_user.is_admin = False  # type:ignore
      edit_user.group = group # type:ignore
    else:
      edit_user.group = group # type:ignore

def setPermission(user:Users, session:Session, data:dict):
  user_permissions = getPermissions(user, session)
  permissions:dict = {}
  for key, value in data.items():
    if not key in ["id", "name"] and value:
      if user.is_admin is True or value in user_permissions:
        permissions[key] = value
  return str(permissions)  # type: ignore
