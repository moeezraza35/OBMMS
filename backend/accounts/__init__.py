from fastapi import FastAPI
from accounts.routes import router

class Accounts:
  def __init__(self, app:FastAPI) -> None:
    app.include_router(router)