from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.core.config import get_settings


class EmbeddingService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model_name = settings.embedding_model
        self.model = SentenceTransformer(self.model_name)

    def embed_text(self, text: str) -> list[float]:
        cleaned_text = text.strip()

        if not cleaned_text:
            raise ValueError("Text cannot be empty.")

        embedding = self.model.encode(
            cleaned_text,
            normalize_embeddings=True,
        )

        return embedding.tolist()

    def get_dimension(self) -> int:
        dimension = self.model.get_sentence_embedding_dimension()

        if dimension is None:
            raise RuntimeError("Unable to determine embedding dimension.")

        return dimension


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()