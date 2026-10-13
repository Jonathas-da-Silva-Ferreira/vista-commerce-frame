from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.auth_service import login_user

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(request: LoginRequest):
    try:
        return login_user(request.email, request.password)
    except ValueError as error:
        raise HTTPException(
            status_code=401,
            detail=str(error),
        )