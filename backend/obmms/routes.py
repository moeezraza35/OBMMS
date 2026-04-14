from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from mr_wshandler import WSHandler, connectionManager
from tracking.models import Bus
from auth.helper import check_session_id
from obmms.database import get_session
from tracking.helper import handleTracking, handleBusStop
import json

router = APIRouter(prefix="")
ws = WSHandler()

@router.websocket("/ws")
@ws.endpoint(mode="dict")
async def onMessage(data:dict, websocket:WebSocket):
  session = get_session()
  try:
    if "session_id" in data:
      user = check_session_id(data["session_id"], session)
      if user:
        await connectionManager.set_client_id(websocket, user.id) # type:ignore
        connectionManager.add_connection_to_room(websocket, "allowed")
    
    if "type" in data:
      if data["type"] == "location":
        await handleTracking(session, websocket, data)
      if data["type"] == "bus stop":
        await handleBusStop(session, data)
  finally:
    session.close()
