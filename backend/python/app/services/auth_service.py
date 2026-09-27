import uuid 

from app.database import get_connection
from app.security import hash_password, verify_password

def register_user(email: str, password: str, display_name: str):
    """
    Create a new customer account
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Check if the email is already registered.
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchall():
            raise ValueError("Email is already registered.")

        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)

        #Created the user
        cursor.execute(
            """
            INSERT INTO users (id, email, password_hash)
            VALUES (%s, %s, %s)
            """,
            (user_id, email, password_hash)
        ) 

        # Create the user´s profile.
        cursor.execute(
            """
            INSERT INTO profiles (id, user_id, email, display_name)
            VALUES (%s, %s, %s, %s)
            """,
            (str(uuid.uuid4()), user_id, email, display_name)
        )

        # New account start as customers.
        cursor.execute(
            """
            INSERT INTO user_roles (id, user_id, role)
            VALUES (%s, %s, %s) 
            """,
            (str(uuid.uuid4()), user_id, "customer")
        )

        connection.commit()

        return {
        "id": user_id,
        "email": email,
        "display_name": display_name,
        "role": "customer",
        }

    except Exception as e:
        connection.rollback()
        raise 

    finally:
        cursor.close()
        connection.close()

def login_user(email: str, password: str):
    """
    Authenticate a user using email and password.
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                u.id,
                u.email,
                u.password_hash,
                p.display_name
            FROM users u
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE u.email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        if not user:
            raise ValueError("Invalid email or password.")

        user_id, user_email, stored_hash, display_name = user

        if not verify_password(password, stored_hash):
            raise ValueError("Invalid email or password.")

        cursor.execute(
            """
            SELECT role
            FROM user_roles
            WHERE user_id = %s
            """,
            (user_id,)
        )

        roles = [row[0] for row in cursor.fetchall()]

        return {
            "id": user_id,
            "email": user_email,
            "display_name": display_name,
            "roles": roles,
        }

    finally:
        cursor.close()
        connection.close()