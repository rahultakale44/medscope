from functools import lru_cache

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.core.config import get_settings
from app.services.embedding_service import get_embedding_service


class QdrantService:
    def __init__(self) -> None:
        settings = get_settings()

        self.collection_name = settings.qdrant_collection
        self.client = QdrantClient(url=settings.qdrant_url)
        self.embedding_service = get_embedding_service()

    def collection_exists(self) -> bool:
        return self.client.collection_exists(
            collection_name=self.collection_name
        )

    def create_collection(self) -> None:
        if self.collection_exists():
            return

        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=self.embedding_service.get_dimension(),
                distance=Distance.COSINE,
            ),
        )

    def get_collection_info(self) -> dict[str, str | int | bool]:
        exists = self.collection_exists()

        if not exists:
            return {
                "collection": self.collection_name,
                "exists": False,
                "points_count": 0,
            }

        info = self.client.get_collection(
            collection_name=self.collection_name
        )

        return {
            "collection": self.collection_name,
            "exists": True,
            "points_count": info.points_count or 0,
            "status": str(info.status),
        }


@lru_cache
def get_qdrant_service() -> QdrantService:
    return QdrantService()