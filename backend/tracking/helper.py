from sqlalchemy.orm import Session
from mr_wshandler import connectionManager, WebSocket
from tracking.models import Bus, Location
from auth.models import Users
from auth.helper import authorize
from admin.helper import save
import json

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

async def handleTracking(session:Session, websocket:WebSocket, data:dict) -> bool:
  print("Authorizing")  # Debug print
  client_id = None
  for connection in connectionManager.active_connections:
    if connection.websocket is websocket:
      client_id = connection.clientId
  if client_id:
    print("Client ID =",client_id)  # Debug print
    user = session.get(Users, client_id)
    print("User =", user) # Debug print
    if not user:
      return False
    if not authorize(user, session, ["location"], False):
      return False
  
  print("Getting Data...", data)  # Debug print
  
  if not "bus" in data:
    return False
  bus = session.get(Bus, data["bus"])
  if bus is None:
    return False
  print(bus.serialize())  # debug print
  if bus.active is False or bus.active is None:
    print("False bus to active...") # Debug print
    await connectionManager.send_message_to_room(json.dumps({
      "type": "bus active",
      "bus": bus.serialize()
    }), "allowed")
    bus.active = True # type:ignore
    save(session, bus)
  print ("Getting location...") # Debug print
  location = getLocation(session, bus)

  if not "latitude" in data:
    return False
  location.latitude = data["latitude"]

  if not "longitude" in data:
    return False
  location.longitude = data["longitude"]
  print("Sending location...")  # debug print
  await connectionManager.send_message_to_room(json.dumps({
    "type": "location",
    "bus": bus.id,
    "location": location.serialize()
  }), "allowed")
  return True

async def handleBusStop(session:Session, data:dict) -> bool:
  if not "bus" in data:
    return False
  print("Getting stoped bus...")  # debug print
  stoped_bus = session.get(Bus, data["bus"])
  if stoped_bus is None:
    return False
  print(stoped_bus)
  stoped_bus.active = False # type:ignore
  print("saving the bus") # Debug print
  save(session, stoped_bus)
  print("Sending info...")  # Debug print
  await connectionManager.send_message_to_room(json.dumps({
    "type": "bus stop",
    "bus": data["bus"]
  }), "allowed")
  return True
