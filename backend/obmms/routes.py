from fastapi import APIRouter, WebSocket
from fastapi.responses import HTMLResponse, FileResponse
from mr_wshandler import WSHandler, connectionManager
from auth.helper import check_session_id
from obmms.database import get_session
from tracking.helper import handleTracking, handleBusStop
import os

router = APIRouter(prefix="")
ws = WSHandler()

def read_index():
  file = open("./templates/index.html", "rt")
  html = file.read()
  file.close()
  return html

@router.get("/")
async def index():
  return HTMLResponse(read_index())

@router.get("/{full_path:path}")
async def route(full_path:str):
  file_path = os.path.join("./static", full_path)
  if os.path.isfile(file_path):
    return FileResponse(file_path)
  return HTMLResponse(read_index())

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
