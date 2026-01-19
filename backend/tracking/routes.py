from fastapi import APIRouter

router = APIRouter(
  prefix="/api/tracking",
  tags=["tracking", "monitoring"]
)