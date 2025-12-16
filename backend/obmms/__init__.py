from fastapi import FastAPI
from obmms.models import *

class OBMMS:
  def __init__(self) -> None:
    self.app = FastAPI()

  def create_tables(self) -> bool:
    Base.metadata.create_all(ENGINE)
    return False