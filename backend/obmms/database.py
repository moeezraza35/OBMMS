from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from obmms.settings import DB_DIALECT, DB_DRIVER, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_ECHO

ENGINE = create_engine(
  f"{DB_DIALECT}+{DB_DRIVER}://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
  echo=DB_ECHO
)

class Base(DeclarativeBase):
  pass