import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import items

# Create database tables
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Failed to create database tables on startup. Check your DATABASE_URL. Error: {e}")

app = FastAPI(
    title="Mart List API",
    description="A RESTful API backend for the Mart List inventory project.",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Welcome to Mart List API"}
