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
    user = require_auth(request, session, "routes")
    buses = session.query(Bus).all()
    return {"buses": [{"id": bus.id, "license": bus.license} for bus in buses ]}
  finally:
    session.close()


@router.get("/buses/active/")
def get_active_buses(request: Request):
  session = get_session()
  try:
    user = require_auth(request, session, "location")
    buses = getBuses(session)
    return {"buses": [bus for bus in buses["buses"] if bus["active"] is not None and bus["active"] is not False]}
  finally:
    session.close()

@router.get("/stops/")
def get_stops(request: Request):
  session = get_session()
  try:
    user = require_auth(request, session, "routes")
    stops = session.query(Stop).filter(Stop.active == True).all()
    return {"stops": [stop.serialize() for stop in stops]}
  finally:
    session.close()