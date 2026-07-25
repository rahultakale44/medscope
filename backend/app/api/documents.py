from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.document_service import DocumentService


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
            raise ValueError("Filename is missing.")

        if not file.filename.lower().endswith(".pdf"):
            raise ValueError("Only PDF files are supported.")

        file_bytes = await file.read()

        if not file_bytes:
            raise ValueError("Uploaded PDF is empty.")

        with NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
        ) as temporary_file:
            temporary_file.write(file_bytes)
            temporary_path = Path(temporary_file.name)

        service = DocumentService()

        result = service.ingest_pdf(
            file_path=temporary_path,
            original_filename=file.filename,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Document ingestion failed: {exc}",
        ) from exc

    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)