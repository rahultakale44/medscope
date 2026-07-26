from app.services.embedding_service import get_embedding_service
from app.services.llm_service import get_llm_service
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

        collection_info = (
            self.qdrant_service.get_collection_info()
        )

        if int(collection_info["points_count"]) == 0:
            raise ValueError(
                "No medical documents are available. "
                "Upload a PDF first."
            )

        query_embedding = (
            self.embedding_service.embed_text(
                cleaned_question
            )
        )

        response = self.qdrant_service.client.query_points(
            collection_name=(
                self.qdrant_service.collection_name
            ),
            query=query_embedding,
            limit=top_k,
            score_threshold=score_threshold,
            with_payload=True,
            with_vectors=False,
        )

        sources: list[
            dict[str, str | int | float]
        ] = []

        for point in response.points:
            payload = point.payload or {}

            text = self._clean_text(
                str(payload.get("text", ""))
            )

            sources.append(
                {
                    "text": text,
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
                    "score": round(
                        float(point.score),
                        4,
                    ),
                }
            )

        return sources

    def answer_question(
        self,
        question: str,
        top_k: int = 3,
        score_threshold: float | None = 0.2,
    ) -> dict:
        sources = self.retrieve(
            question=question,
            top_k=top_k,
            score_threshold=score_threshold,
        )

        if not sources:
            return {
                "answer": (
                    "The uploaded documents do not contain "
                    "enough evidence to answer this question "
                    "reliably."
                ),
                "grounded": False,
                "sources": [],
            }

        context = self._build_context(sources)

        llm_service = get_llm_service()

        answer = llm_service.generate_answer(
            question=question,
            context=context,
        )

        return {
            "answer": answer,
            "grounded": True,
            "sources": sources,
        }

    @staticmethod
    def _clean_text(text: str) -> str:
        return " ".join(
            text.replace("\u00a0", " ")
            .replace("\\n", " ")
            .replace("\n", " ")
            .split()
        )

    @staticmethod
    def _build_context(
        sources: list[
            dict[str, str | int | float]
        ],
    ) -> str:
        context_parts: list[str] = []

        for index, source in enumerate(
            sources,
            start=1,
        ):
            context_parts.append(
                (
                    f"Source {index}\n"
                    f"Document: "
                    f"{source['document_name']}\n"
                    f"Page: {source['page_number']}\n"
                    f"Evidence: {source['text']}"
                )
            )

        return "\n\n".join(context_parts)