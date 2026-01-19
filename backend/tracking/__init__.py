from fastapi import FastAPI
from tracking.routes import router

class Tracking:
  def __init__(self, app:FastAPI) -> None:
    app.include_router(router)