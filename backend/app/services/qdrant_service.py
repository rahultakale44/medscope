from functools import lru_cache
from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    VectorParams,
)

from app.core.config import get_settings
from app.services.embedding_service import get_embedding_service


class QdrantService:
    def __init__(self) -> None:
        settings = get_settings()

        self.collection_name = settings.qdrant_collection
        self.client = QdrantClient(
            url=settings.qdrant_url,
        )
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

    def get_collection_info(
        self,
    ) -> dict[str, str | int | bool]:
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

    @staticmethod
    def build_hash_filter(file_hash: str) -> Filter:
        return Filter(
            must=[
                FieldCondition(
                    key="file_hash",
                    match=MatchValue(value=file_hash),
                )
            ]
        )

    @staticmethod
    def build_name_filter(
        document_name: str,
    ) -> Filter:
        return Filter(
            must=[
                FieldCondition(
                    key="document_name",
                    match=MatchValue(
                        value=document_name
                    ),
                )
            ]
        )

    def document_exists(
        self,
        file_hash: str,
    ) -> bool:
        if not self.collection_exists():
            return False

        points, _ = self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=self.build_hash_filter(
                file_hash
            ),
            limit=1,
            with_payload=False,
            with_vectors=False,
        )

        return len(points) > 0

    def get_document_points(
        self,
        file_hash: str,
    ) -> list[Any]:
        if not self.collection_exists():
            return []

        all_points: list[Any] = []
        next_offset = None

        while True:
            points, next_offset = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=self.build_hash_filter(
                    file_hash
                ),
                limit=100,
                offset=next_offset,
                with_payload=True,
                with_vectors=False,
            )

            all_points.extend(points)

            if next_offset is None:
                break

        return all_points

    def delete_document(
        self,
        file_hash: str,
    ) -> int:
        points = self.get_document_points(file_hash)
        deleted_count = len(points)

        if deleted_count == 0:
            return 0

        self.client.delete(
            collection_name=self.collection_name,
            points_selector=FilterSelector(
                filter=self.build_hash_filter(
                    file_hash
                )
            ),
            wait=True,
        )

        return deleted_count


@lru_cache
def get_qdrant_service() -> QdrantService:
    return QdrantService()