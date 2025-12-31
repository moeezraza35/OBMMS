from fastapi import FastAPI
from admin.routes import router

class Admin:
  def __init__(self, app:FastAPI) -> None:
    app.include_router(router)