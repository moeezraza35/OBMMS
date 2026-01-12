from sqlalchemy import Column, Integer, String, Boolean, JSON
from passlib.context import CryptContext
from obmms.database import Base
from obmms.settings import SCHEMES, DEPRECATED

PWD_CONTEXT = CryptContext(schemes=SCHEMES, deprecated=DEPRECATED)

class Users(Base):
  __tablename__ = "users"

  id = Column(name="id", type_=Integer, autoincrement=True, primary_key=True)
  name = Column(name="name", type_=String(30))
  _password_ = Column(name="password", type_=String(255))
  reset_required = Column(name="reset_required", type_=Boolean)
  group = Column(name="group", type_=Integer)
  is_admin = Column(name="is_admin", type_=Boolean)
  active = Column(name="active", type_=Boolean)

  @property
  def password(self):
    raise AttributeError("password is write-only")
  
  @password.setter
  def password(self, psw: str):
    self._password_ = PWD_CONTEXT.hash(psw)
  
  def checkPassword(self, password:str) -> bool:
    return PWD_CONTEXT.verify(secret=password,hash=self._password_) # type:ignore
    
  def serialize(self) -> dict:
    return {
      "id" : self.id,
      "name" : self.name,
      "reset_required" : self.reset_required,
      "group" : self.group,
      "is_admin" : self.is_admin,
      "active" : self.active
    }
  
  def __repr__(self) -> str:
    return f"({self.id}) {self.name}"
  
class Group(Base):
  __tablename__ = "group"

  id = Column(name="id", type_=Integer, autoincrement=True, primary_key=True)
  name = Column(name="name", type_=String(64))
  permissions = Column(name="permissions", type_=JSON)

  def serialize(self)-> dict:
    return {
      "id" : self.id,
      "name" : self.name,
      "permissions" : self.permissions
    }

  def __repr__(self) -> str:
    return f"({self.id}) {self.name}"