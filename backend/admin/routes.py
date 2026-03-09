from fastapi import APIRouter, Request, HTTPException, status
from auth.models import Users, Group
from admin.models import Logs, Notifications
from tracking.models import Bus, Location, Stop, Route
from accounts.models import Package, History
from obmms.settings import MODELS
from obmms.database import get_session
from auth.helper import authenticate, require_auth, getGroups
from admin.helper import save, delete, allowedModels, assignGroup, saveLog, setPermission
from tracking.helper import getBuses
from accounts.helper import saveHistory
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

@router.get("/logs/all/")
def get_all_logs(request:Request) -> dict:
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Login Required")
    if user.is_admin is True:
      logs = session.query(Logs).all()
    else:
      logs = session.query(Logs).filter(Logs.user == user.id).all()
    return {"logs": [log.serialize() for log in logs]}
  finally:
    session.close()

@router.get("/users/all/")
async def get_all_users(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "users")
    users = session.query(Users).all()
    return {"users" : [u.serialize() for u in users]}
  finally:
    session.close()

@router.get("/group/all/")
async def get_all_groups(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "group")
    return getGroups(session)
  finally:
    session.close()

@router.get("/buses/all/")
def get_all_buses(request: Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "buses")
    return getBuses(session)
  finally:
    session.close()

@router.get("/stops/all/")
def get_all_stops(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "stops")
    stops = session.query(Stop).all()
    return {"stops": [stop.serialize() for stop in stops]}
  finally:
    session.close()

@router.get("/routes/all/")
def get_all_routes(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "routes")
    routes = session.query(Route).all()
    return {"routes": [route.serialize() for route in routes]}
  finally:
    session.close()

@router.get("/packages/all/")
def get_all_packages(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "packages")
    packages = session.query(Package).all()
    return {"packages": [pkg.serialize() for pkg in packages]}
  finally:
    session.close()

@router.get("/history/all/")
def get_all_history(request:Request) -> dict: 
  session = get_session()
  try:
    user = require_auth(request, session, "history")
    history = session.query(History).all()
    return {"history": [h.serialize() for h in history]}
  finally:
    session.close()

@router.get("/location/all/")
def get_all_location(request:Request) -> dict:
  session = get_session()
  try:
    user = require_auth(request, session, "location")
    location = session.query(Location).all()
    return {"location": [loc.serialize() for loc in location]}
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
    saveLog(session, user, "C", "users", new_user.id) # type:ignore
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
    saveLog(session, user, "C", "group", group.id) # type:ignore
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
    saveLog(session, user, "C", "buses", bus.id) # type:ignore
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
    saveLog(session, user, "C", "stops", stop.id) # type:ignore
    return {"stop": stop.serialize()}
  finally:
    session.close()

@router.post("/routes/add/")
async def add_route(request: Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "routes")
    if not "id" in data or data["id"] == "":
      route = Route()
    else:
      existing_route = session.get(Route, data["id"])
      if existing_route is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Already Exists")
      route = Route(id=data["id"])
    
    if not "departure" in data or data["departure"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Departure not given")
    route.departure = data["departure"]

    if not "destination" in data or data["destination"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Destination not given")
    route.destination = data["destination"]

    if not "bus" in data or data["bus"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Bus not given")
    route.bus = data["bus"]

    if not "time" in data or data["time"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Time not given")
    route.time = data["time"]

    if not "active" in data or data["active"] == False:
      route.active = False # type:ignore
    else:
      route.active = True  # type:ignore

    save(session, route)
    saveLog(session, user, "C", "routes", route.id) # type:ignore
    return {"route": route.serialize()}
  finally:
    session.close()

@router.post("/packages/add/")
async def add_package(request: Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "packages")
    if not "id" in data or data["id"] == "":
      package = Package()
    else:
      existing_package = session.get(Package, data["id"])
      if existing_package is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Already Exists")
      package = Package(id=data["id"])
    
    if not "user" in data or data["user"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "User not given")
    package.user = data["user"]

    if not "price" in data or data["price"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Price not given")
    package.price = data["price"]

    if "amount" in data and data["amount"] != "" and data["amount"] != 0:
      package.amount = data["amount"]
    else:
      package.amount = 0  # type:ignore
    
    if "installments" in data and data["installments"] != "" and data["installments"] != 0:
      package.installments = data["installments"]
    else:
      package.installments = 1  # type:ignore
    
    if not "start" in data or data["start"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Start date not given")
    package.start = data["start"]

    if not "end" in data or data["end"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "End date not given")
    package.end = data["end"]

    if not "active" in data or data["active"] == False:
      package.active = False # type:ignore
    else:
      package.active = True  # type:ignore

    save(session, package)
    saveLog(session, user, "C", "packages", package.id) # type:ignore
    if package.amount != 0: # type:ignore
      saveHistory(session, package.id, package.amount) # type:ignore
    return {"package": package.serialize()}
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
    saveLog(session, user, "U", "users", edit_user.id) # type:ignore
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
      json.loads(group.permissions.replace("'",'"'))
    )
    
    save(session, group)
    saveLog(session, user, "U", "group", group.id) # type:ignore
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
    saveLog(session, user, "U", "buses", bus.id) # type:ignore
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
      if stop.active is False:
        routes = session.query(Route).filter((Route.departure == stop.id) | (Route.destination == stop.id)).all() # type:ignore
        for route in routes:
          session.delete(route)
        delete(session, stop)

    if "campus" in data:
      stop.is_campus = data["campus"]

    save(session, stop)
    saveLog(session, user, "U", "stops", stop.id) # type:ignore
    return {"stop": stop.serialize()}
  finally:
    session.close()

@router.post("/routes/update/")
async def update_route(request: Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "routes", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Route ID not given")
    route = session.get(Route, data["id"])
    if route is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND, "Route with ID# {} not found".format(data["id"]))
    
    if "departure" in data and data["departure"] != "":
      route.departure = data["departure"]

    if "destination" in data and data["destination"] != "":
      route.destination = data["destination"]

    if "bus" in data and data["bus"] != "":
      route.bus = data["bus"]

    if "time" in data and data["time"] != "":
      route.time = data["time"]

    if "active" in data:
      route.active = data["active"]

    save(session, route)
    saveLog(session, user, "U", "routes", route.id) # type:ignore
    return {"route": route.serialize()}
  finally:
    session.close()

@router.post("/packages/update/")
async def update_package(request: Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "packages", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Package ID not given")
    package = session.get(Package, data["id"])
    if package is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND, "Package with ID# {} not found".format(data["id"]))
    
    if "user" in data and data["user"] != "":
      package.user = data["user"]

    if "price" in data and data["price"] != "":
      package.price = data["price"]

    if "amount" in data and data["amount"] != "" and data["amount"] != 0:
      saveHistory(session, package.id, float(data["amount"])) # type:ignore
      package.amount += float(data["amount"])  # type:ignore

    if "installments" in data and data["installments"] != "" and data["installments"] != 0:
      package.installments = data["installments"]
    else:
      package.installments = 1  # type:ignore

    if "start" in data and data["start"] != "":
      package.start = data["start"]

    if "end" in data and data["end"] != "":
      package.end = data["end"]

    if "active" in data:
      package.active = data["active"]

    save(session, package)
    saveLog(session, user, "U", "packages", package.id) # type:ignore
    return {"package": package.serialize()}
  finally:
    session.close()

# Deleting Routes

@router.post("/logs/delete/")
async def delete_log(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Login Required")
    if user.is_admin is not True:
      raise HTTPException(status.HTTP_403_FORBIDDEN,"Admins only")
    
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Log ID not given")
    log = session.get(Logs, data["id"])
    if log is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"Log with ID# {} not found".format(data["id"]))
    
    delete(session, log)
    return {"message": "Log with ID# {} deleted".format(data["id"])}
  finally:
    session.close()

@router.post("/users/delete/")
async def delete_user(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "users", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "User ID not given")
    del_user = session.get(Users, data["id"])
    buses = session.query(Bus).filter(Bus.driver == del_user.id).all()  # type:ignore
    for bus in buses:
      bus.driver = None # type:ignore
    if del_user is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"No user found with ID {}".format(data["id"]))
    
    delete(session, del_user)
    saveLog(session, user, "D", "users", del_user.id) # type:ignore
    return {"message": "User with ID# {} deleted".format(data["id"])}
  finally:
    session.close()

@router.post("/group/delete/")
async def delete_group(request:Request) -> dict:
  data:dict = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "group", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Group ID not given")
    group = session.get(Group, data["id"])
    if group is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"No group found with ID# {}".format(data["id"]))
    
    users = session.query(Users).filter(Users.group == group.id).all() # type:ignore
    for u in users:
      u.group = None # type:ignore
      u.is_admin = None # type:ignore

    delete(session, group)
    saveLog(session, user, "D", "group", group.id) # type:ignore
    return {"message": "Group with ID# {} deleted".format(data["id"])}
  finally:
    session.close()

@router.post("/buses/delete/")
async def delete_bus(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "buses", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Bus ID not given")
    bus = session.get(Bus, data["id"])
    if bus is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"Bus with ID# {} not found".format(data["id"]))
    
    delete(session, bus)
    saveLog(session, user, "D", "buses", bus.id) # type:ignore
    return {"message": "Bus with ID# {} deleted".format(data["id"])}
  finally:
    session.close()

@router.post("/stops/delete/")
async def delete_stop(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "stops", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stop ID not given")
    stop = session.get(Stop, data["id"])
    if stop is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"Stop with ID# {} not found".format(data["id"]))
    
    routes = session.query(Route).filter((Route.departure == stop.id) | (Route.destination == stop.id)).all() # type:ignore
    for route in routes:
      session.delete(route)

    delete(session, stop)
    saveLog(session, user, "D", "stops", stop.id) # type:ignore
    return {"message": "Stop with ID# {} deleted".format(data["id"])}
  finally:
    session.close()

@router.post("/routes/delete/")
async def delete_route(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "routes", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Route ID not given")
    route = session.get(Route, data["id"])
    if route is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"Route with ID# {} not found".format(data["id"]))
    
    delete(session, route)
    saveLog(session, user, "D", "routes", route.id) # type:ignore
    return {"message": "Route with ID# {} deleted".format(data["id"])}
  finally:
    session.close()

@router.post("/packages/delete/")
async def delete_package(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "packages", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "Package ID not given")
    package = session.get(Package, data["id"])
    if package is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"Package with ID# {} not found".format(data["id"]))
    
    delete(session, package)
    saveLog(session, user, "D", "packages", package.id) # type:ignore
    return {"message": "Package with ID# {} deleted".format(data["id"])}
  finally:
    session.close()

@router.post("/history/delete/")
async def delete_history(request:Request) -> dict:
  data = await request.json()
  session = get_session()
  try:
    user = require_auth(request, session, "history", False)
    if not "id" in data or data["id"] == "":
      raise HTTPException(status.HTTP_400_BAD_REQUEST, "History ID not given")
    history = session.get(History, data["id"])
    if history is None:
      raise HTTPException(status.HTTP_404_NOT_FOUND,"History with ID# {} not found".format(data["id"]))
    
    delete(session, history)
    saveLog(session, user, "D", "history", history.id) # type:ignore
    return {"message": "History with ID# {} deleted".format(data["id"])}
  finally:
    session.close()