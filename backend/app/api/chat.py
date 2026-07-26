from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    RetrievalRequest,
    RetrievalResponse,
)
from app.services.rag_service import RAGService


router = APIRouter(
    prefix="/chat",
    tags=["Retrieval"],
)


@router.post(
    "/retrieve",
    response_model=RetrievalResponse,
)
def retrieve_medical_context(
    request: RetrievalRequest,
) -> RetrievalResponse:
    try:
        service = RAGService()

        sources = service.retrieve(
            question=request.question,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
        )

        return RetrievalResponse(
            question=request.question,
            total_results=len(sources),
            sources=sources,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Medical retrieval failed: {exc}",
        ) from exc