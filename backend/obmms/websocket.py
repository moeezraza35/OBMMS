from starlette.websockets import WebSocket

class Connection:
  def __init__(self, websocket:WebSocket, user:int, allowed:bool) -> None:
    self.websocket = websocket
    self.user = user
    self.allowed = allowed

class WebSocketManager:
  def __init__(self) -> None:
    self.connections:list[Connection] = []
  
  async def connect(self, websocket:WebSocket, user:int):
    await websocket.accept()
    self.connections.append(Connection(websocket, user, True))
  
  def disconnect(self, user:int):
    for connection in self.connections:
      if connection.user == user:
        self.connections.remove(connection)
        break

  async def broadcast(self, message: str):
    for connection in self.connections:
      await connection.websocket.send_text(message)
  
  async def send_personal(self, user:int, message:str):
    for connection in self.connections:
      if connection.user == user:
        await connection.websocket.send_text(message)
        break
  
  async def send_to_allowed(self, message:str):
    for connection in self.connections:
      if connection.allowed:
        await connection.websocket.send_text(message)

websocketManager = WebSocketManager()
