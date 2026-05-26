from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.exc import IntegrityError, OperationalError
from obmms.models import *
from obmms.routes import router
from auth import Auth
from admin import Admin
from tracking import Tracking
from accounts import Accounts
from obmms.settings import SECRET_KEY, SESSION_COOKIE, SAME_SITE, HTTPS_ONLY, ALLOW_ORIGINS, ALLOW_CREDENTIALS, ALLOW_METHODS, ALLOW_HEADERS
import sys

class OBMMS:
  def __init__(self) -> None:
    self.app = FastAPI()
    self.app.add_middleware(
      SessionMiddleware,
      secret_key=SECRET_KEY,  # type:ignore
      session_cookie=SESSION_COOKIE,  # type:ignore
      same_site=SAME_SITE,
      https_only=HTTPS_ONLY,  # Set to True if using HTTPS
    )
    self.app.add_middleware(
      CORSMiddleware,
      allow_origins=ALLOW_ORIGINS,
      allow_credentials=ALLOW_CREDENTIALS,
      allow_methods=ALLOW_METHODS,
      allow_headers=ALLOW_HEADERS,
    )
    Auth(self.app)
    Admin(self.app)
    Tracking(self.app)
    Accounts(self.app)
    self.app.include_router(router)
    self.app.mount("/", StaticFiles(directory="static"), name="static")

  def create_tables(self) -> bool:
    try:
      Base.metadata.create_all(ENGINE)
      return True
    except:
      print("\033[91mConnectionError: Unable to create tables\033[0m")
      return False
  
  def create_super_user(self) -> bool:
    user_id = input("Enter user id (Press enter to auto-assign): ")
    name = ""
    while name == "":
      name = input("Enter user's name: ")
    password = ""
    while password == "":
      password = input("Enter Password: ")
    confirm_password = ""
    while confirm_password == "":
      confirm_password = input("Enter Password again: ")

    if password != confirm_password:
      print("\033[91mValueError: Password and confirm password does not match\033[0m")
      return False

    user = None
    if user_id != "":
      try:
        user = Users(id=int(user_id))
      except:
        print("\033[91mValueError: Entered user ID is invalid\033[0m", file=sys.stderr)
        return False
    else:
      user = Users()
    
    user.name = name  # type:ignore
    user.password = password  # type:ignore
    user.reset_required = False # type:ignore
    user.is_admin = True  # type:ignore
    user.active = True  # type:ignore
    
    session = get_session()
    try:
      session.add(user)
      session.commit()
      session.close()
      return True
    except IntegrityError:
      print(f"\033[91mIntegrityError: User ID: '{user_id}' is already used\033[0m")
    except OperationalError:
      print(f"\033[91mOperationalError: Can't connect to database server\033[0m")
    session.close()
    return False