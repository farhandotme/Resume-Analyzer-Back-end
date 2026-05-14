from fastapi import FastAPI

from routes.chat import router as chatRouter

from services.rag_service import router as servicesRouter

app = FastAPI()

app.include_router(chatRouter)
app.include_router(servicesRouter)


@app.get("/")
def read_root():
    return {"message": "Hello, this is AI RESUME CHECKER"}
