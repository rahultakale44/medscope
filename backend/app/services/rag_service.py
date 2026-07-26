from app.services.embedding_service import get_embedding_service
from app.services.qdrant_service import get_qdrant_service


class RAGService:
    def __init__(self) -> None:
        self.embedding_service = get_embedding_service()
        self.qdrant_service = get_qdrant_service()

    def retrieve(
        self,
        question: str,
        top_k: int = 3,
        score_threshold: float | None = None,
    ) -> list[dict[str, str | int | float]]:
        cleaned_question = question.strip()

        if not cleaned_question:
            raise ValueError("Question cannot be empty.")

        if not self.qdrant_service.collection_exists():
            raise ValueError(
                "The medical document collection does not exist."
            )

        collection_info = self.qdrant_service.get_collection_info()

        if int(collection_info["points_count"]) == 0:
            raise ValueError(
                "No medical documents are available. Upload a PDF first."
            )

        query_embedding = self.embedding_service.embed_text(
            cleaned_question
        )

        query_response = self.qdrant_service.client.query_points(
            collection_name=self.qdrant_service.collection_name,
            query=query_embedding,
            limit=top_k,
            score_threshold=score_threshold,
            with_payload=True,
            with_vectors=False,
        )

        retrieved_sources: list[
            dict[str, str | int | float]
        ] = []

        for point in query_response.points:
            payload = point.payload or {}

            retrieved_sources.append(
                {
                    "text": str(payload.get("text", "")),
                    "document_name": str(
                        payload.get(
                            "document_name",
                            "Unknown document",
                        )
                    ),
                    "page_number": int(
                        payload.get("page_number", 0)
                    ),
                    "chunk_index": int(
                        payload.get("chunk_index", 0)
                    ),
                    "score": round(float(point.score), 4),
                }
            )

        return retrieved_sources