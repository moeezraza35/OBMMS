from fastapi import APIRouter, WebSocket
from tracking.models import Bus
from auth.helper import check_session_id
from obmms.database import get_session
from tracking.helper import handleTracking, handleBusStop
from obmms.websocket import websocketManager
import json

router = APIRouter(prefix="")

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
  await websocket.accept()
  data = await websocket.receive_json()
  if not "session_id" in data:
    await websocket.close(1008, "Login Required")
    return
  session = get_session()
  user = check_session_id(data["session_id"], session)
  if user is None:
    await websocket.close(1008, "Invalid Session ID")
    return
  await websocketManager.connect(websocket, user.id) # type:ignore
  try:
    while True:
      data = await websocket.receive_json()
      if not "type" in data:
        continue
      if data["type"] == "location":
        print("Location Received")
        await handleTracking(session, user, data)
      elif data["type"] == "bus stop":
        print("Bus gone inactive")
        await handleBusStop(session, data)
  except Exception as e:
    print("An error occured:", e)
    await websocket.close()
    buses = session.query(Bus).filter(Bus.driver==user.id).all()
    for bus in buses:
      if bus.active is True:
        bus.active = False  # type:ignore
        await websocketManager.send_to_allowed(json.dumps({
          "type": "bus stop",
          "bus": bus.id,
        }))
    websocketManager.disconnect(user.id)  # type:ignore
  finally:
    session.close()
