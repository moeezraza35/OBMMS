from fastapi import APIRouter, Request, HTTPException, status
from obmms.database import get_session
from auth.helper import authenticate
from accounts.helper import *
from accounts.models import Package, History

router = APIRouter(
  prefix="/api/accounts",
  tags=["Accounts", "Payments"]
)

@router.get("/packages/")
def get_packages(request:Request):
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    packages = session.query(Package).filter(Package.user == user.id and Package.active == True).all()
    return {
      "packages": [package.serialize() for package in packages]
    }
  finally:
    session.close()

@router.get("/history/")
def get_history(request:Request):
  session = get_session()
  try:
    user = authenticate(request, session)
    if user is None:
      raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Login Required")
    history = session.query(History).filter(History.user == user.id).all()
    return {
      "history": [hist.serialize() for hist in history]
    }
  finally:
    session.close()