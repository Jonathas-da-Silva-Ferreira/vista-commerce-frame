from fastapi import FastAPI

from app.services.category_service import get_categories
from app.routes.auth import router as auth_router

app = FastAPI(title="Vista Commerce Python Service")

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "Vista Commerce Python Service is running!"
    }

@app.get("/categories")
def read_categories():
    return get_categories()