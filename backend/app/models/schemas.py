from pydantic import BaseModel, Field


class RetrievalRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
    )

    top_k: int = Field(
        default=3,
        ge=1,
        le=10,
    )

    score_threshold: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
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


class MedicalQueryRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
    )

    top_k: int = Field(
        default=3,
        ge=1,
        le=5,
    )

    score_threshold: float | None = Field(
        default=0.2,
        ge=0.0,
        le=1.0,
    )


class CitationSource(BaseModel):
    document_name: str
    page_number: int
    chunk_index: int
    score: float


class MedicalQueryResponse(BaseModel):
    question: str
    answer: str
    grounded: bool
    total_sources: int
    sources: list[CitationSource]
    disclaimer: str


class DocumentInfo(BaseModel):
    document_name: str
    file_hash: str
    chunks_count: int
    pages_count: int


class DocumentListResponse(BaseModel):
    total_documents: int
    documents: list[DocumentInfo]


class DocumentDeleteResponse(BaseModel):
    status: str
    document_name: str
    deleted_chunks: int
    message: str