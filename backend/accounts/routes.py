from fastapi import APIRouter
from accounts.helper import *

router = APIRouter(
  prefix="/api/accounts",
  tags=["Accounts", "Payments"]
)