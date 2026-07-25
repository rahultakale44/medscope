from pathlib import Path

import fitz


def extract_pdf_pages(file_path: str | Path) -> list[dict[str, str | int]]:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError("Only PDF files are supported.")

    pages: list[dict[str, str | int]] = []

    with fitz.open(path) as document:
        for page_number, page in enumerate(document, start=1):
            text = page.get_text("text").strip()

            if text:
                pages.append(
                    {
                        "page_number": page_number,
                        "text": text,
                    }
                )

    if not pages:
        raise ValueError("No readable text was found in the PDF.")

    return pages