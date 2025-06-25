from fastapi import FastAPI
from app.core.breeze import initialize_breeze_session
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Or your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("✔️ main.py loaded")

app.include_router(router)
