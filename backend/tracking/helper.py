from sqlalchemy.orm import Session
from tracking.models import Bus, Location
from auth.models import Users
from auth.helper import authorize
from admin.helper import save
from obmms.websocket import websocketManager

def getBuses(session:Session):
  buses = session.query(Bus).all()
  return {"buses": [bus.serialize() for bus in buses]}

def getLocation(session:Session, bus:Bus) -> Location:
  if bus.location is None or bus.location == 0: # type:ignore
    location = Location()
    save(session, location)
    bus.location = location.id
    save(session, bus)
    return location
  location = session.get(Location, bus.location)
  if location is not None:
    return location
  location = Location(id=bus.location)
  save(session, location)
  return location

async def handleTracking(session:Session, user:Users, data:dict) -> bool:
  if not authorize(user, session, ["location"], False):
    return False
  
  if not "bus" in data:
    return False
  bus = session.get(Bus, data["bus"])
  if bus is None:
    return False
  if bus.active is False:
    await websocketManager.send_to_allowed(str({
      "type": "new bus",
      "bus": bus.serialize()
    }))
    bus.active = True # type:ignore

  location = getLocation(session, bus)

  if not "latitudes" in data:
    return False
  location.latitude = data["latitude"]

  if not "longitudes" in data:
    return False
  location.longitude = data["longitude"]

  await websocketManager.send_to_allowed(str({
    "type": "location",
    "bus": bus.id,
    "location": location.serialize()
  }))
  return True