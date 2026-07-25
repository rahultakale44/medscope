from pathlib import Path
from uuid import uuid4

from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client.models import PointStruct

from app.services.embedding_service import get_embedding_service
from app.services.qdrant_service import get_qdrant_service
from app.utils.pdf_parser import extract_pdf_pages


class DocumentService:
    def __init__(self) -> None:
        self.embedding_service = get_embedding_service()
        self.qdrant_service = get_qdrant_service()

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=700,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def ingest_pdf(
        self,
        file_path: str | Path,
        original_filename: str,
    ) -> dict[str, str | int]:
        path = Path(file_path)

        self.qdrant_service.create_collection()

        pages = extract_pdf_pages(path)

        points: list[PointStruct] = []
        chunk_count = 0

        for page in pages:
            page_number = int(page["page_number"])
            page_text = str(page["text"])

            chunks = self.text_splitter.split_text(page_text)

            for chunk_index, chunk in enumerate(chunks):
                cleaned_chunk = chunk.strip()

                if not cleaned_chunk:
                    continue

                embedding = self.embedding_service.embed_text(
                    cleaned_chunk
                )

                points.append(
                    PointStruct(
                        id=str(uuid4()),
                        vector=embedding,
                        payload={
                            "text": cleaned_chunk,
                            "document_name": original_filename,
                            "page_number": page_number,
                            "chunk_index": chunk_index,
                        },
                    )
                )

                chunk_count += 1

        if not points:
            raise ValueError(
                "No valid text chunks were generated from the PDF."
            )

        self.qdrant_service.client.upsert(
            collection_name=self.qdrant_service.collection_name,
            points=points,
            wait=True,
        )

        return {
            "status": "success",
            "document_name": original_filename,
            "pages_processed": len(pages),
            "chunks_stored": chunk_count,
        }