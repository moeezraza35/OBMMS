from datetime import date, datetime
from sqlalchemy.orm import Session
from accounts.models import History, Package
from auth.models import Users
from admin.helper import save

def saveHistory(session:Session, package:int, amount:float, add=True):
  history = None
  if not add:
    history = session.query(History).filter(History.package == package).first()
    if history:
      history.amount = amount # type:ignore
      save(session, history)
      return
  history = History(
    package=package,
    amount=amount,
    date=date.today(),
    time=datetime.now().time(),
  )
  save(session, history)

def activePackage(session:Session, user:Users) -> bool:
  package = session.query(Package).filter(Package.user == user.id and Package.active).all()
  if len(package) == 0:
    return False
  return True