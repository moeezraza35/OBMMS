from fastapi import FastAPI
from auth.routes import router

class Auth:
  def __init__(self, app:FastAPI) -> None:
    app.include_router(router)