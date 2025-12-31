from datetime import datetime, timezone, timedelta
from fastapi import Request
from sqlalchemy.orm import Session
from obmms.settings import SECRET_KEY, JWT_ALGORITHM, JWT_EXIPRE, JWT_EXP_TIME
from auth.models import Users, Group
import jwt
import json

def check_session(request:Request, session:Session) -> Users | None:
  if not "user" in request.session:
    return None
  
  if request.session["user"] is None or request.session == "":
    return None
  
  return check_session_id(request.session["user"], session)

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
    session_id = request.query_params.get("session_id")
    if session_id is not None:
      user = check_session_id(session_id, session)
  return user

def authorize(user: Users, session: Session, model:str, readonly=True) -> bool:
  if user.is_admin: # type:ignore
    return True
  group = session.get(Group, user.group)
  permission = json.load(group.permissions) # type:ignore
  if model in permission:
    if readonly or permission[model] == 'w':
      return True
  return False