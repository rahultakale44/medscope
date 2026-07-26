import { FileText, Trash2 } from "lucide-react";
import Button from "../ui/Button";

export default function DocumentCard({ document, onDelete }) {
  const shortHash = document.file_hash ? document.file_hash.substring(0, 12) + "..." : "N/A";

  return (
    <div className="document-card">
      <div className="document-icon">
        <FileText size={24} />
      </div>
      <div className="document-info">
        <div className="document-name">{document.document_name}</div>
        <div className="document-meta">
          <span>{document.pages_count} pages</span>
          <span>{document.chunks_count} chunks</span>
          <span className="document-hash">{shortHash}</span>
        </div>
      </div>
      <div className="document-actions">
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(document)}
          aria-label="Delete document"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  );
}
