from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


from app.dependencies import get_current_user
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str

@router.post("/register")
def register(request: RegisterRequest):
    try:
        return register_user(
            request.email,
            request.password,
            request.display_name,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/login")
def login(request: LoginRequest):
    try:
        return login_user(request.email, request.password)
    except ValueError as error:
        raise HTTPException(
            status_code=401,
            detail=str(error),
        )

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
