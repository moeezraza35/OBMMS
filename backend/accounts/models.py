from sqlalchemy import Column, Integer, Boolean, Float, Date, Time
from obmms.database import Base

class Package(Base):
  __tablename__ = "package"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  user = Column(name="user", type_=Integer)
  price = Column(name="price", type_=Float)
  month = Column(name="month", type_=Integer) # 1 to 12
  year = Column(name="year", type_=Integer)
  active = Column(name="active", type_=Boolean)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "user": self.user,
      "price": self.price,
      "month": self.month,
      "year": self.year,
      "active": self.active
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) User: {self.user}, Price: {self.price}, Month: {self.month}, Year: {self.year}, Active: {self.active}"

class History(Base):
  __tablename__ = "history"

  id = Column(name="id", type_=Integer, primary_key=True, autoincrement=True)
  package = Column(name="package", type_=Integer)
  user = Column(name="user", type_=Integer)
  amount = Column(name="amount", type_=Float)
  date = Column(name="date", type_=Date)
  time = Column(name="time", type_=Time)

  def serialize(self) -> dict:
    return {
      "id": self.id,
      "package": self.package,
      "user": self.user,
      "amount": self.amount,
      "date": self.date.isoformat(),
      "time": self.time.isoformat()
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) Package: {self.package}, User: {self.user}, Amount: {self.amount}, Date: {self.date}, Time: {self.time}"