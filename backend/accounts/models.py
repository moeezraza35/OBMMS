from sqlalchemy import Column, Integer, Boolean, Float, Date, Time
from obmms.database import Base

class Package(Base):
  __tablename__ = "package"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  user = Column(name="user", type_=Integer)
  price = Column(name="price", type_=Float)
  amount = Column(name="amount", type_=Float)
  installments = Column(name="installments", type_=Integer)
  start = Column(name="start", type_=Date)
  end = Column(name="end", type_=Date)
  active = Column(name="active", type_=Boolean)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "user": self.user,
      "price": self.price,
      "amount": self.amount,
      "installments": self.installments,
      "start": self.start.isoformat(),
      "end": self.end.isoformat(),
      "active": self.active
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) User: {self.user}, Price: {self.price}, Amount: {self.amount}, Installments: {self.installments}, Start: {self.start}, End: {self.end}, Active: {self.active}"

class History(Base):
  __tablename__ = "history"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  package = Column(name="package", type_=Integer)
  amount = Column(name="amount", type_=Float)
  date = Column(name="date", type_=Date)
  time = Column(name="time", type_=Time)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "package": self.package,
      "amount": self.amount,
      "date": self.date.isoformat(),
      "time": self.time.isoformat()
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) Package: {self.package}, Amount: {self.amount}, Date: {self.date}, Time: {self.time}"