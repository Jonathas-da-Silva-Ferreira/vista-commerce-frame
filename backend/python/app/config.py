
import os
from pathlib import Path
from dotenv import load_dotenv

# Locate the project root directory.
BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env", override=True)

# Load environment variables from the project root .env file.
load_dotenv(BASE_DIR / ".env", override=True)


class Settings:
    mysql_host: str = os.getenv("MYSQL_HOST", "localhost")
    mysql_port: int = int(os.getenv("MYSQL_PORT", "3306"))
    mysql_database: str = os.getenv("MYSQL_DATABASE", "vista_commerce")
    mysql_user: str = os.getenv("MYSQL_USER", "root")
    mysql_password: str = os.getenv("MYSQL_PASSWORD", "")


settings = Settings()
