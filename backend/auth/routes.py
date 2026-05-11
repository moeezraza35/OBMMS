from fastapi import APIRouter, Request, HTTPException, status
from obmms.database import get_session
from admin.helper import save
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
  try:
    if not "sap" in data or data["sap"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "SAP ID not given")
    user = session.get(Users, ident=int(data["sap"]))
    if user is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"User with SAP# {} not found.".format(data["sap"]))
    session_id = ""
    if not "password" in data or data["password"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Password not given")
    if user.checkPassword(data["password"]):
      session_id = create_session_id(user)
    if session_id == "":
      raise HTTPException(status.HTTP_403_FORBIDDEN,"Incorrect password")
    request.session["user"] = session_id
    return {"session_id" : session_id,}
  finally:
    session.close()

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
    request.session["user"] = session_id
    return {
      "session_id": session_id,
      "user": user.serialize()
    }
  return {
    "session_id": "",
    "user": None
  }

@router.get("/logout/")
async def logout(request:Request) -> dict:
  if "user" in request.session:
    del request.session["user"]
  return {"session_id" : ""}

@router.get("/permissions/")
async def permissions(request:Request) -> dict:
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Login Required")
    return {"permissions":getPermissions(user, session)}
  finally:
    session.close()

@router.post("/change_password/")
async def change_password(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = check_session(request, session)
    if user is None:
      auth_header = request.headers.get("Authorization")
      if auth_header and auth_header.startswith("Bearer "):
        session_id = auth_header.split(" ")[1]
        user = check_session_id(session_id, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    user.password = data["password"]
    user.reset_required = False # type:ignore
    save(session, user)
    return {"message": "Password changed successfully"}
  finally:
    session.close()

@router.get("/groups/")
async def get_groups(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "users")
    result = getGroups(session)
    for group in result["groups"]:
      del group["permissions"]
    return result
  finally:
    session.close()

@router.get("/group/")
async def get_group(request:Request) -> dict:
  session = get_session()
  try:
    user = authenticate(request, session)
    if not user:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    
    if user.is_admin is True:
      return {
        "group": "Admin"
      }
    group = session.get(Group, user.group)
    if group:
      return {
        "group": group.name
      }
    else:
      return {
        "group": ""
      }
  finally:
    session.close

@router.get("/drivers/")
async def get_drivers(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "buses")
    groups = session.query(Group).all()
    allowed_groups = []
    for group in groups:
      permissions = json.loads(group.permissions.replace("'", '"'))  # type:ignore
      if "location" in permissions and permissions["location"] == "w":
        allowed_groups.append(group.id)
    drivers = session.query(Users).filter(Users.group.in_(allowed_groups)).all()
    return {"drivers": [driver.serialize() for driver in drivers]}
  finally:
    session.close()