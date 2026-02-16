from sqlalchemy import Column, Integer, String, CHAR, Date, Time, Boolean
from obmms.database import Base

class Logs(Base):
  __tablename__ = "logs"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  user = Column(name="user", type_=Integer)
  model = Column(name="model", type_=String(30))
  action = Column(name="action", type_=CHAR(1))
  row = Column(name="row", type_=Integer)
  date = Column(name="date", type_=Date)
  time = Column(name="time", type_=Time)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "user": self.user,
      "model": self.model,
      "action": self.action,
      "row": self.row,
      "date": self.date.isoformat(),
      "time": self.time.isoformat()
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) {self.model}, Action: {self.action}"

class Notifications(Base):
  __tablename__ = "notifications"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  user = Column(name="user", type_=Integer)
  message = Column(name="message", type_=String(255))
  date = Column(name="date", type_=Date)
  time = Column(name="time", type_=Time)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "user": self.user,
      "message": self.message,
      "date": self.date.isoformat(),
      "time": self.time.isoformat()
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) {self.message}"