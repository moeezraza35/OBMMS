from sqlalchemy import Column, Integer, String
from obmms.database import *

class users(Base):
  __tablename__ = "user_account"

  id = Column(name="id", type_=Integer, autoincrement=True, primary_key=True)
  name = Column(name="name", type_=String(30))

  def __repr__(self) -> str:
    return f"User(id={self.id!r}, name={self.name!r})"