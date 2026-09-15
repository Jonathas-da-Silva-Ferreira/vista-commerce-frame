from fastapi import FastAPI

app = FastAPI(title="Vista Commerce Python Service")


@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "Vista Commerce Python Service is running!"
    }