from pydantic import BaseModel, Field


class RetrievalRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Medical literature question to search.",
    )

    top_k: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of relevant passages to retrieve.",
    )

    score_threshold: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Optional minimum similarity score.",
    )


class RetrievedSource(BaseModel):
    text: str
    document_name: str
    page_number: int
    chunk_index: int
    score: float


class RetrievalResponse(BaseModel):
    question: str
    total_results: int
    sources: list[RetrievedSource]