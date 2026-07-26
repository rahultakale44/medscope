from collections import defaultdict
from pathlib import Path
from uuid import uuid4

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)
from qdrant_client.models import PointStruct

from app.services.embedding_service import (
    get_embedding_service,
)
from app.services.qdrant_service import (
    get_qdrant_service,
)
from app.utils.pdf_parser import extract_pdf_pages


class DocumentService:
    def __init__(self) -> None:
        self.embedding_service = get_embedding_service()
        self.qdrant_service = get_qdrant_service()

        self.text_splitter = (
            RecursiveCharacterTextSplitter(
                chunk_size=700,
                chunk_overlap=100,
                separators=[
                    "\n\n",
                    "\n",
                    ". ",
                    " ",
                    "",
                ],
            )
        )

    def ingest_pdf(
        self,
        file_path: str | Path,
        original_filename: str,
        file_hash: str,
    ) -> dict[str, str | int]:
        path = Path(file_path)

        self.qdrant_service.create_collection()

        if self.qdrant_service.document_exists(
            file_hash
        ):
            raise ValueError(
                "This PDF has already been uploaded."
            )

        pages = extract_pdf_pages(path)

        points: list[PointStruct] = []
        chunk_count = 0

        for page in pages:
            page_number = int(
                page["page_number"]
            )
            page_text = str(page["text"])

            chunks = self.text_splitter.split_text(
                page_text
            )

            for chunk_index, chunk in enumerate(
                chunks
            ):
                cleaned_chunk = self._clean_text(chunk)

                if not cleaned_chunk:
                    continue

                embedding = (
                    self.embedding_service.embed_text(
                        cleaned_chunk
                    )
                )

                points.append(
                    PointStruct(
                        id=str(uuid4()),
                        vector=embedding,
                        payload={
                            "text": cleaned_chunk,
                            "document_name": (
                                original_filename
                            ),
                            "file_hash": file_hash,
                            "page_number": page_number,
                            "chunk_index": chunk_index,
                            "pages_count": len(pages),
                        },
                    )
                )

                chunk_count += 1

        if not points:
            raise ValueError(
                "No valid text chunks were generated "
                "from the PDF."
            )

        self.qdrant_service.client.upsert(
            collection_name=(
                self.qdrant_service.collection_name
            ),
            points=points,
            wait=True,
        )

        return {
            "status": "success",
            "document_name": original_filename,
            "file_hash": file_hash,
            "pages_processed": len(pages),
            "chunks_stored": chunk_count,
        }

    def list_documents(
        self,
    ) -> list[dict[str, str | int]]:
        if not self.qdrant_service.collection_exists():
            return []

        documents: dict[
            str,
            dict[str, str | int],
        ] = {}

        next_offset = None

        while True:
            points, next_offset = (
                self.qdrant_service.client.scroll(
                    collection_name=(
                        self.qdrant_service.collection_name
                    ),
                    limit=100,
                    offset=next_offset,
                    with_payload=True,
                    with_vectors=False,
                )
            )

            for point in points:
                payload = point.payload or {}

                file_hash = str(
                    payload.get("file_hash", "")
                )

                # Older chunks may not have a hash.
                if not file_hash:
                    continue

                if file_hash not in documents:
                    documents[file_hash] = {
                        "document_name": str(
                            payload.get(
                                "document_name",
                                "Unknown document",
                            )
                        ),
                        "file_hash": file_hash,
                        "chunks_count": 0,
                        "pages_count": int(
                            payload.get(
                                "pages_count",
                                0,
                            )
                        ),
                    }

                documents[file_hash][
                    "chunks_count"
                ] = (
                    int(
                        documents[file_hash][
                            "chunks_count"
                        ]
                    )
                    + 1
                )

            if next_offset is None:
                break

        return list(documents.values())

    def delete_document(
        self,
        file_hash: str,
    ) -> dict[str, str | int]:
        points = (
            self.qdrant_service.get_document_points(
                file_hash
            )
        )

        if not points:
            raise ValueError(
                "Document not found."
            )

        payload = points[0].payload or {}

        document_name = str(
            payload.get(
                "document_name",
                "Unknown document",
            )
        )

        deleted_count = (
            self.qdrant_service.delete_document(
                file_hash
            )
        )

        return {
            "status": "success",
            "document_name": document_name,
            "deleted_chunks": deleted_count,
            "message": (
                "Document and its vector chunks "
                "were deleted successfully."
            ),
        }

    @staticmethod
    def _clean_text(text: str) -> str:
        return " ".join(
            text.replace("\u00a0", " ")
            .replace("\\n", " ")
            .replace("\n", " ")
            .split()
        )