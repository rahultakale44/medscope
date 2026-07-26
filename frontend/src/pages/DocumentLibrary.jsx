import { useState, useEffect } from "react";
import { FileSearch, RefreshCw, Search } from "lucide-react";
import { listDocuments, deleteDocument } from "../services/api";
import { useToast } from "../hooks/useToast";
import DocumentCard from "../components/cards/DocumentCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Modal from "../components/ui/Modal";
import Toast from "../components/shared/Toast";
import PageHeader from "../components/shared/PageHeader";

export default function DocumentLibrary() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toasts, showToast, hideToast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listDocuments();
      setDocuments(response.data.documents || []);
      setFilteredDocs(response.data.documents || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredDocs(
        documents.filter((doc) =>
          doc.document_name.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredDocs(documents);
    }
  }, [searchQuery, documents]);

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      setDeleting(true);
      await deleteDocument(documentToDelete.file_hash);
      
      showToast({
        type: "success",
        title: "Document deleted",
        message: `${documentToDelete.document_name} has been removed.`,
      });

      setDocuments((prev) =>
        prev.filter((doc) => doc.file_hash !== documentToDelete.file_hash)
      );
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Delete failed",
        message: err.message || "Failed to delete document.",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Document Library" description="Manage indexed medical literature" />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Document Library" description="Manage indexed medical literature" />
        <ErrorState message={error} onRetry={fetchDocuments} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Document Library"
        description="Manage indexed medical literature"
        action={
          <Button variant="secondary" onClick={fetchDocuments}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        }
      />

      {documents.length > 0 && (
        <div className="library-header">
          <div className="search-box">
            <div className="form-input" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Search size={18} style={{ color: "var(--color-text-muted)" }} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: "none", background: "none", outline: "none", width: "100%", padding: 0 }}
              />
            </div>
          </div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            {filteredDocs.length} {filteredDocs.length === 1 ? "document" : "documents"}
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No documents yet"
          description="Upload your first medical PDF to start building your knowledge base."
          action={
            <Button variant="primary" onClick={() => window.location.href = "/upload"}>
              Upload Document
            </Button>
          }
        />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No matching documents"
          description="Try adjusting your search query."
        />
      ) : (
        <div className="document-list">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.file_hash}
              document={doc}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Document"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>
              Delete
            </Button>
          </>
        }
      >
        {documentToDelete && (
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Are you sure you want to delete <strong>{documentToDelete.document_name}</strong>?
            This will remove {documentToDelete.chunks_count} chunks from Qdrant. This action cannot be undone.
          </p>
        )}
      </Modal>

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={hideToast} />
        ))}
      </div>
    </>
  );
}
