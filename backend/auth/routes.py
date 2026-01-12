from fastapi import APIRouter, Request, HTTPException, status
from obmms.database import get_session
from auth.models import Users
from auth.helper import *

router = APIRouter(
  prefix="/api/auth",
  tags=["Authentication"]
)

@router.post("/login/")
async def login_submit(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  user = session.get(Users, ident=int(data["sap"]))
  session.close()
  if user is None:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="User with SAP# {} not found.".format(data["sap"])
    )
  session_id = ""
  if user.checkPassword(data["password"]):
    session_id = create_session_id(user)
  
  if session_id == "":
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Incorrect password"
    )
  request.session["user"] = session_id
  return {
    "session_id" : session_id,
  }

@router.get("/login/check/", status_code=status.HTTP_200_OK)
async def login_check(request:Request) -> dict:
  session_id = ""
  session = get_session()
  user = check_session(request, session)
  if user is not None:
    session.close()
    session_id = request.session["user"]
    if JWT_EXIPRE:
      session_id = create_session_id(user)
    return {
      "session_id" : session_id,
      "user" : user.serialize()
    }
  auth_header = request.headers.get("Authorization")
  if auth_header and auth_header.startswith("Bearer "):
    session_id = auth_header.split(" ")[1]
    user = check_session_id(session_id, session)
    session.close()
  
  if user is not None:
    if JWT_EXIPRE:
      session_id = create_session_id(user)
    return {
      "session_id": session_id,
      "user": user.serialize()
    }
  return {
    "session_id": "",
    "user": None
  }

@router.get("/logout/")
def logout(request:Request) -> dict:
  if "user" in request.session:
    del request.session["user"]
  return {
    "session_id" : ""
  }

@router.get("/permissions/")
def permissions(request:Request) -> dict:
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Login Required"
      )
    return {
      "permissions":getPermissions(user, session)
    }
  finally:
    session.close()