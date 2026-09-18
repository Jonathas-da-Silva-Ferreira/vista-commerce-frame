from fastapi import FastAPI


from app.services.category_service import get_categories

app = FastAPI(title="Vista Commerce Python Service")


@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "Vista Commerce Python Service is running!"
    }

@app.get("/categories")
def read_categories():
    return get_categories()