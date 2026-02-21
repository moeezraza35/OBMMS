from sqlalchemy.orm import Session
from tracking.models import Bus

def getBuses(session:Session):
  buses = session.query(Bus).all()
  return {"buses": [bus.serialize() for bus in buses]}