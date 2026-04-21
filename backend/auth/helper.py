from datetime import datetime, timezone, timedelta
from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session
from auth.models import Users, Group
from obmms.settings import SECRET_KEY, JWT_ALGORITHM, JWT_EXIPRE, JWT_EXP_TIME
import jwt
import json

def check_session(request:Request, session:Session) -> Users | None:
  if not "user" in request.session:
    return None
  
  if request.session["user"] is None or request.session == "":
    return None
  
  user = check_session_id(request.session["user"], session)
  if user is None or user.active is False:
    return None
  return user

def check_session_id(session_id:str, session:Session) -> Users | None:
  data = None
  try:
    data = jwt.decode(
      jwt=session_id,
      key=SECRET_KEY,
      algorithms=JWT_ALGORITHM
    )
  except:
    return None
  return session.get(Users, data["user"])

def create_session_id(user: Users) -> str:
  data:dict = {
    "user":user.id,
  }
  if JWT_EXIPRE:
    data["exp"] = datetime.now(tz=timezone.utc) + timedelta(days=JWT_EXP_TIME)
  session_id = jwt.encode(data,SECRET_KEY, JWT_ALGORITHM)
  return session_id

def authenticate(request:Request, session: Session) -> None | Users:
  user = check_session(request, session)
  if user is None:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
      session_id = auth_header.split(" ")[1]
      user = check_session_id(session_id, session)
  
  if user is None or user.reset_required is True:
    return None
  
  return user

def getPermissions(user:Users, session:Session) -> dict:
  if user.is_admin is True or user.group is None or user.group is 0:
    return {}
  group = session.get(Group, user.group)
  try:
    return json.loads(group.permissions.replace("'", '"'))  # type:ignore
  except json.JSONDecodeError:
    return {}

def authorize(user: Users, session: Session, models:list[str], readonly=True) -> bool:
  if user.is_admin: # type:ignore
    return True
  permission = getPermissions(user, session)
  for model in models:
    if model in permission:
      if readonly or permission[model] == 'w':
        return True
  return False

def require_auth(request:Request, session:Session, model:str, readonly=True) -> Users:
  user = authenticate(request, session)
  if user is None:
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
  if not authorize(user, session, [model], readonly):
    raise HTTPException(status.HTTP_403_FORBIDDEN, "Not Allowed")
  return user

def getGroups(session:Session) -> dict:
  result = {"groups": []}
  groups = session.query(Group).all()
  for group in groups:
    result["groups"].append(group.serialize())
  return result