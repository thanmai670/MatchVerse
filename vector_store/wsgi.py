from fastapi import APIRouter, HTTPException, FastAPI
from Endpoints import router as vector_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include the routes from Endpoints.py
app.include_router(vector_router)
