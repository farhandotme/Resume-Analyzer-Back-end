from fastapi import FastAPI
from routes.chat import router as chatRouter

app = FastAPI()

app.include_router(chatRouter)


@app.get("/")
def read_root():
    return {"message": "Hello, this is AI RESUME CHECKER"}
