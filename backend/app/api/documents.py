import hashlib
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from app.models.schemas import (
    DocumentDeleteResponse,
    DocumentListResponse,
)
from app.services.document_service import (
    DocumentService,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
) -> dict[str, str | int]:
    temporary_path: Path | None = None

    try:
        if not file.filename:
            raise ValueError(
                "Filename is missing."
            )

        if not file.filename.lower().endswith(
            ".pdf"
        ):
            raise ValueError(
                "Only PDF files are supported."
            )

        file_bytes = await file.read()

        if not file_bytes:
            raise ValueError(
                "Uploaded PDF is empty."
            )

        max_file_size = 25 * 1024 * 1024

        if len(file_bytes) > max_file_size:
            raise ValueError(
                "PDF size cannot exceed 25 MB."
            )

        file_hash = hashlib.sha256(
            file_bytes
        ).hexdigest()

        with NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
        ) as temporary_file:
            temporary_file.write(file_bytes)

            temporary_path = Path(
                temporary_file.name
            )

        service = DocumentService()

        return service.ingest_pdf(
            file_path=temporary_path,
            original_filename=file.filename,
            file_hash=file_hash,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Document ingestion failed: {exc}"
            ),
        ) from exc

    finally:
        if temporary_path is not None:
            temporary_path.unlink(
                missing_ok=True
            )


@router.get(
    "",
    response_model=DocumentListResponse,
)
def list_documents() -> DocumentListResponse:
    try:
        service = DocumentService()

        documents = service.list_documents()

        return DocumentListResponse(
            total_documents=len(documents),
            documents=documents,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to list documents: {exc}"
            ),
        ) from exc


@router.delete(
    "/{file_hash}",
    response_model=DocumentDeleteResponse,
)
def delete_document(
    file_hash: str,
) -> DocumentDeleteResponse:
    try:
        if len(file_hash) != 64:
            raise ValueError(
                "Invalid document hash."
            )

        service = DocumentService()

        result = service.delete_document(
            file_hash
        )

        return DocumentDeleteResponse(
            **result
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to delete document: {exc}"
            ),
        ) from exc