from fastapi import APIRouter, HTTPException, Request, status
from tracking.models import Bus, Stop
from obmms.database import get_session
from auth.helper import authenticate, authorize, require_auth
from tracking.helper import getBuses

router = APIRouter(
  prefix="/api/tracking",
  tags=["tracking", "monitoring"]
)

@router.get("/buses/")
def get_buses(request: Request):
  session = get_session()
  try:
    # user = require_auth(request, session, "location")
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    if authorize(user, session, "buses") is False:
      if authorize(user, session, "route") is False:
        if authorize(user, session, "location") is False:
          raise HTTPException(status.HTTP_403_FORBIDDEN, "Not Allowed")
    buses = getBuses(session)
    result = {"buses": []}
    for bus in buses["buses"]:
      if bus["active"] is None or bus["active"] is False:
        continue
      result["buses"].append(bus)
    return result
  finally:
    session.close()

@router.get("/stops/")
def get_stops(request: Request):
  session = get_session()
  try:
    user = require_auth(request, session, "location")
    stops = session.query(Stop).filter(Stop.active == True).all()
    return {"stops": [stop.serialize() for stop in stops]}
  finally:
    session.close()