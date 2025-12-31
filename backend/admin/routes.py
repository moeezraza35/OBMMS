from fastapi import APIRouter, Request, HTTPException, status
from obmms.database import get_session
from auth.models import Users
from auth.helper import authenticate, authorize

router = APIRouter(
  prefix="/api/admin",
  tags=["Administration", "Admin site"]
)

@router.get("/users/all/")
def get_all_users(request:Request) -> dict:
  session = get_session()
  user = authenticate(request, session)
  if user is None:
    session.close()
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Login required"
    )
  if not authorize(user, session, "users"):
    session.close()
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN
    )
  result = {
    "users" : []
  }
  users = session.query(Users).all()
  for record in users:
    result["users"].append(record.serialize())
  session.close()
  return result