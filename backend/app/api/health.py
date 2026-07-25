from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.services.embedding_service import get_embedding_service
from app.services.qdrant_service import get_qdrant_service


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "MedScope API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/embedding")
def embedding_health_check() -> dict[str, int | str]:
    try:
        service = get_embedding_service()

        embedding = service.embed_text(
            "Hypertension is associated with cardiovascular complications."
        )

        return {
            "status": "healthy",
            "model": service.model_name,
            "dimension": len(embedding),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Embedding model failed: {exc}",
        ) from exc


@router.post("/qdrant/initialize")
def initialize_qdrant() -> dict[str, str | bool]:
    try:
        service = get_qdrant_service()
        service.create_collection()

        return {
            "status": "healthy",
            "message": "Qdrant collection initialized successfully.",
            "collection": service.collection_name,
            "exists": service.collection_exists(),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Qdrant initialization failed: {exc}",
        ) from exc


@router.get("/qdrant")
def qdrant_health_check() -> dict[str, str | int | bool]:
    try:
        service = get_qdrant_service()
        return service.get_collection_info()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Qdrant health check failed: {exc}",
        ) from exc