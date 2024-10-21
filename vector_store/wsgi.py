from fastapi import FastAPI
from Endpoints import router as vector_router

app = FastAPI()

# Include the routes from Endpoints.py
app.include_router(vector_router)
