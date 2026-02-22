from datetime import date, datetime
from sqlalchemy.orm import Session
from accounts.models import History
from admin.helper import save

def saveHistory(session:Session, package:int, amount:float):
  history = History(
    package=package,
    amount=amount,
    date=date.today(),
    time=datetime.now().time(),
  )
  save(session, history)
    