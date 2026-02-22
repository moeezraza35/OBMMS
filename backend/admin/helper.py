from datetime import date, datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, DeclarativeBase
from admin.models import Logs
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

def delete(session:Session, obj:DeclarativeBase):
  try:
    session.delete(obj)
    session.commit()
  except Exception as e:
    session.rollback()
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Database Error: "+str(e)
    )

def allowedModels(session:Session, user:Users) -> list[str]:
  models = ["users", "group"]
  if user.is_admin is True:
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

def setPermission(user:Users, session:Session, data:dict, existing_permissions:dict = {}):
  user_permissions = getPermissions(user, session)
  permissions = existing_permissions.copy()
  for key, value in data.items():
    if not key in ["id", "name"]:
      if user.is_admin is True:
        if value:
          permissions[key] = value
        else:
          if key in permissions:
            del permissions[key]
      elif key in user_permissions:
        if user_permissions[key] == "w":
          if value:
            permissions[key] = value
          else:
            if key in permissions:
              del permissions[key]
  return str(permissions)  # type: ignore

def saveLog(session:Session, user:Users, action:str, model:str, row:int):
  log = Logs(
    user=user.id,
    model=model,
    action=action,
    row=row,
    date=date.today(),
    time=datetime.now().time()
  )
  save(session, log)