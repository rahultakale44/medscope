from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router

app = FastAPI(
    title="MedScope API",
    description=(
        "Evidence-grounded medical literature retrieval system "
        "using BioMistral-7B, PubMedBERT and Qdrant."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "MedScope",
        "status": "running",
        "documentation": "/docs",
    }