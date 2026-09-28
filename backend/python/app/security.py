from datetime import datetime, timedelta, timezone


import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

password_hash = PasswordHash((Argon2Hasher(),))

#JWT configuration
SECRET_KEY = "your_secret_key" 
ALGORITHM = "HS256"
ACESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    """
    Hash a password before storing it in the database.
    """
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a password against its stored hash.
    """
    return password_hash.verify(password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta  | None = None) -> str:
    """
    Crate JWT acess token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes= ACESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    """
    Decode and validade a JWT access token.
    """

    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])