from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.category_service import get_categories
from app.routes.auth import router as auth_router

app = FastAPI(title="Vista Commerce Python Service")


# Allow the local React frontend to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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