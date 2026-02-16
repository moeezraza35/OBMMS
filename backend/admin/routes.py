from fastapi import APIRouter, Request, HTTPException, status
from auth.models import Users, Group
from tracking.models import Bus, Stop
from obmms.settings import MODELS
from obmms.database import get_session
from auth.helper import authenticate, authorize, require_auth
from admin.helper import save, allowedModels, assignGroup, setPermission
import json

router = APIRouter(
  prefix="/api/admin",
  tags=["Administration", "Admin site"]
)

# Reading Routes

@router.get("/models/")
async def get_allowed_models(request:Request) -> dict:
  models = MODELS
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Login Required")
    if user.is_admin is True:
      return {"models" : models}
    allowed_models = allowedModels(session, user)
    return {"models" : allowed_models}
  finally:
    session.close()

@router.get("/users/all/")
async def get_all_users(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "users")
    result = {"users" : []}
    users = session.query(Users).all()
    for record in users:
      result["users"].append(record.serialize())
    return result
  finally:
    session.close()

@router.get("/group/all/")
async def get_all_groups(request:Request) -> dict:
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Login Required")
    result = {"groups" : []}
    groups = session.query(Group).all()
    for group in groups:
      result["groups"].append(group.serialize())
    if not authorize(user, session, "group"):
      if not authorize(user, session, "users"):
        raise HTTPException(status.HTTP_403_FORBIDDEN,"Not Allowed")
      for group in result["groups"]:
        del group["permissions"]
    return result
  finally:
    session.close()

@router.get("/buses/all/")
def get_all_buses(request: Request) -> dict:
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if not authorize(user, session, "buses"):
      if not authorize(user, session, "location"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not Allowed")
    result = {"buses": []}
    buses = session.query(Bus)
    for bus in buses:
      result["buses"].append(bus.serialize())
    return result
  finally:
    session.close()

@router.get("/stops/all/")
def get_all_stops(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "stops")
    result = {"stops": []}
    stops = session.query(Stop).all()
    for stop in stops:
      result["stops"].append(stop.serialize())
    return result
  finally:
    session.close()

# Adding Routes

@router.post("/users/add/")
async def add_user(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "users", False)

    if not "id" in data or data["id"] == "":
      new_user = Users()
    else:
      existing_user = session.get(Users, data["id"])
      if existing_user is not None:
        raise HTTPException(status.HTTP_409_CONFLICT,"ID Exists")
      new_user = Users(id=data["id"])
    
    if "group" in data and data["group"] != "":
      assignGroup(user, new_user, data["group"])
    
    if not "name" in data or data["name"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "User name not given")
    new_user.name = data["name"]
    
    if not "password" in data or data["password"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Password not given")
    new_user.password = data["password"]
    new_user.reset_required = True  # type:ignore

    if not "active" in data or data["active"] == False:
      new_user.active = False # type:ignore
    else:
      new_user.active = True  # type:ignore

    save(session, new_user)
    return {"user": new_user.serialize()}
  finally:
    session.close()

@router.post("/group/add/")
async def add_group(request:Request) -> dict:
  data:dict = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "group", False)
    if not "id" in data or data["id"] == "":
      group = Group()
    else:
      existing_group = session.get(Group, data["id"])
      if existing_group is not None:
        raise HTTPException(status.HTTP_409_CONFLICT,"ID Exists")
      group = Group(id=data["id"])
    
    if not "name" in data or data["name"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST,"Group name not given")
    group.name = data["name"]

    group.permissions = setPermission(user, session, data)  # type: ignore

    save(session, group)
    return {"group" : group.serialize()}
  finally:
    session.close()

@router.post("/buses/add/")
async def add_bus(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "buses", False)
    if not "id" in data or data["id"] == "":
      bus = Bus()
    else:
      existing_bus = session.get(Bus, data["id"])
      if existing_bus is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Already Exists")
      bus = Bus(id=data["id"])
    
    if not "license" in data or data["license"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "License No. not given")
    bus.license = data["license"]

    if not "capacity" in data or data["capacity"] == "" or data["capacity"] == 0:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Bus capacity not given")
    bus.capacity = data["capacity"]

    save(session, bus)
    return {"bus": bus.serialize()}
  finally:
    session.close()

@router.post("/stops/add/")
async def add_stop(request: Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "stops", False)
    if not "id" in data or data["id"] == "":
      stop = Stop()
    else:
      existing_stop = session.get(Bus, data["id"])
      if existing_stop is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Already Exists")
      stop = Stop(id=data["id"])
    
    if not "name" in data or data["name"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stop name not given")
    stop.name = data["name"]

    if not "description" in data or data["description"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stop description not given")
    stop.description = data["description"]

    if not "latitudes" in data or data["latitudes"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stop Latitudes not given")
    stop.latitude = data["latitudes"]

    if not "longitudes" in data or data["longitudes"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stop Longitudes not given")
    stop.longitude = data["longitudes"]

    if not "active" in data or data["active"] == False:
      stop.active = False # type:ignore
    else:
      stop.active = True  # type:ignore

    if not "campus" in data or data["campus"] == False:
      stop.is_campus = False  # type:ignore
    else:
      stop.is_campus = True   # type:ignore
    
    save(session, stop)
    return {"stop": stop.serialize()}
  finally:
    session.close()

# Updating Routes

@router.post("/users/update/")
async def update_user(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "users", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "User ID not given")
    edit_user = session.get(Users, data["id"])
    if edit_user is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"No user found with ID {}".format(data["id"]))
    
    if "group" in data:
      edit_user.is_admin = None # type:ignore
      edit_user.group = None  # type:ignore
      assignGroup(user, edit_user, data["group"])

    if "passwrod" in data and data["password"] != "":
      edit_user.password = data["password"]
      edit_user.reset_required = True # type:ignore

    if "name" in data and data["name"] != "":
      edit_user.name = data["name"]
    
    if "active" in data:
      edit_user.active = data["active"]

    save(session, edit_user)
    return {"user": edit_user.serialize()}
  finally:
    session.close()

@router.post("/group/update/")
async def update_group(request:Request) -> dict:
  data:dict = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "group", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Group ID not given")
    group = session.get(Group, data["id"])
    if group is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"No group found with ID# {}".format(data["id"]))
    
    if "name" in data or data["name"] != "":
      group.name = data["name"]
    
    group.permissions = setPermission(  # type:ignore
      user,
      session,
      data,
      json.loads(group.permissions.replace("'",'"')))
    
    save(session, group)
    return {"group": group.serialize()}
  finally:
    session.close()

@router.post("/buses/update/")
async def update_bus(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "buses", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Bus ID not given")
    bus = session.get(Bus, data["id"])
    if bus is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"Bus with ID# {} not found".format(data["id"]))
    
    if "license" in data and data["license"] != "":
      bus.license = data["license"]
    
    if "capacity" in data and data["capacity"] != "" and data["capacity"] != 0:
      bus.capacity = data["capacity"]
    
    save(session, bus)
    return {"bus": bus.serialize()}
  finally:
    session.close()

@router.post("/stops/update/")
async def update_stop(request: Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "stops", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stop ID not given")
    stop = session.get(Stop, data["id"])
    if stop is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND, "Stop with ID# {} not found".format(data["id"]))
    
    if "name" in data and data["name"] != "":
      stop.name = data["name"]

    if "description" in data and data["description"] != "":
      stop.description = data["description"]

    if "latitudes" in data and data["latitudes"] != "":
      stop.latitude = data["latitudes"]

    if "longitudes" in data and data["longitudes"] != "":
      stop.longitude = data["longitudes"]

    if "active" in data:
      stop.active = data["active"]

    if "campus" in data:
      stop.is_campus = data["campus"]

    save(session, stop)
    return {"stop": stop.serialize()}
  finally:
    session.close()