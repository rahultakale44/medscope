from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    CitationSource,
    MedicalQueryRequest,
    MedicalQueryResponse,
    RetrievalRequest,
    RetrievalResponse,
)
from app.services.rag_service import RAGService


router = APIRouter(
    prefix="/chat",
    tags=["Medical RAG"],
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
            score_threshold=(
                request.score_threshold
            ),
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


@router.post(
    "/query",
    response_model=MedicalQueryResponse,
)
def query_medical_documents(
    request: MedicalQueryRequest,
) -> MedicalQueryResponse:
    try:
        service = RAGService()

        result = service.answer_question(
            question=request.question,
            top_k=request.top_k,
            score_threshold=(
                request.score_threshold
            ),
        )

        citations = [
            CitationSource(
                document_name=str(
                    source["document_name"]
                ),
                page_number=int(
                    source["page_number"]
                ),
                chunk_index=int(
                    source["chunk_index"]
                ),
                score=float(
                    source["score"]
                ),
            )
            for source in result["sources"]
        ]

        return MedicalQueryResponse(
            question=request.question,
            answer=str(result["answer"]),
            grounded=bool(result["grounded"]),
            total_sources=len(citations),
            sources=citations,
            disclaimer=(
                "This response summarizes uploaded medical "
                "literature and is not a medical diagnosis or "
                "treatment recommendation."
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Medical RAG query failed: {exc}",
        ) from exc