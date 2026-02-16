from sqlalchemy import Column, Integer, String, Boolean, Float
from obmms.database import Base

class Bus(Base):
  __tablename__ = "bus"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  license = Column(name="license", type_=String(30), unique=True)
  capacity = Column(name="capacity", type_=Integer)
  passengers = Column(name="passengers", type_=Integer, default=0)
  location = Column(name="location", type_=Integer)
  driver = Column(name="driver", type_=Integer)
  active = Column(name="active", type_=Boolean)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "license": self.license,
      "capacity": self.capacity,
      "passengers": self.passengers,
      "location": self.location,
      "driver": self.driver,
      "active": self.active
    }

  def __repr__(self) -> str:
    return f"({self.id}) {self.license}"
  
class Location(Base):
  __tablename__ = "location"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  latitude = Column(name="latitude", type_=Float)
  longitude = Column(name="longitude", type_=Float)
  heading = Column(name="heading", type_=Float)
  speed = Column(name="speed", type_=Integer)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "location": (self.latitude, self.longitude),
      "heading": self.heading,
      "speed": self.speed
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) [{self.latitude}, {self.longitude}]"
  
class Stop(Base):
  __tablename__ = "stop"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  name = Column(name="name", type_=String(50))
  description = Column(name="description", type_=String(255))
  latitude = Column(name="latitude", type_=Float)
  longitude = Column(name="longitude", type_=Float)
  is_campus = Column(name="is_campus", type_=Boolean)
  active = Column(name="active", type_=Boolean)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "name": self.name,
      "description": self.description,
      "location": (self.latitude, self.longitude),
      "is_campus": self.is_campus,
      "active": self.active
    }

  def __repr__(self) -> str:
    return f"({self.id}) {self.name}"