from fastapi import APIRouter, HTTPException, Request, status
from tracking.models import Bus, Route, Stop
from obmms.database import get_session
from auth.helper import authenticate, authorize, require_auth
from tracking.helper import getBuses, getLocation
from accounts.helper import activePackage

router = APIRouter(
  prefix="/api/tracking",
  tags=["tracking", "monitoring"]
)

@router.get("/buses/")
def get_buses(request: Request):
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if not authorize(user, session, ["buses", "routes", "location"], readonly=True):
      if not activePackage(session, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Permission Denied")
    buses = session.query(Bus).all()
    return {"buses": [{"id": bus.id, "license": bus.license, "location": bus.location} for bus in buses ]}
  finally:
    session.close()

@router.get("/buses/active/")
def get_active_buses(request: Request):
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if not authorize(user, session, ["buses", "location"], readonly=True):
      if not activePackage(session, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Permission Denied")
    buses = getBuses(session)
    return {"buses": [bus for bus in buses["buses"] if bus["active"] is not None and bus["active"] is not False]}
  finally:
    session.close()

@router.get("/buses/my/")
def get_my_buses(request: Request):
  session = get_session()
  try:
    user = require_auth(request, session, "location", False)
    buses = session.query(Bus).filter(Bus.driver == user.id)
    print(buses)  # Debug print
    return {
      "buses": [{"id": bus.id, "name": bus.license} for bus in buses]
    }
  finally:
    session.close()

@router.get("/stops/")
def get_stops(request: Request):
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if not authorize(user, session, ["stops", "routes", "location"], readonly=True):
      if not activePackage(session, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Permission Denied")
    stops = session.query(Stop).filter(Stop.active == True).all()
    return {"stops": [stop.serialize() for stop in stops]}
  finally:
    session.close()

@router.get("/location/")
def get_location(request: Request):
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if not authorize(user, session, ["location"], readonly=True):
      if not activePackage(session, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Permission Denied")
    buses = session.query(Bus).filter(Bus.active == True).all()
    location = [getLocation(session, bus) for bus in buses]
    return {
      "buses": [bus.serialize() for bus in buses],
      "location": [loc.serialize() for loc in location]
    }
  finally:
    session.close()
  
@router.get("/routes/")
def get_routes(request: Request):
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if not authorize(user, session, ["routes", "location"], readonly=True):
      if not activePackage(session, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Permission Denied")
    routes = session.query(Route).filter(Route.active == True).all()
    return {
      "routes": [route.serialize() for route in routes]
    }
  finally:
    session.close()