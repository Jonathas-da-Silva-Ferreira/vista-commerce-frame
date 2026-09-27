from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

password_hash = PasswordHash((Argon2Hasher(),))


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