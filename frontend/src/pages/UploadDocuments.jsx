import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { uploadDocument } from "../services/api";
import FileDropzone from "../components/document/FileDropzone";
import Button from "../components/ui/Button";
import PageHeader from "../components/shared/PageHeader";

export default function UploadDocuments() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileSelect = (file) => {
    setError("");
    setResult(null);

    if (!file.type.includes("pdf")) {
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("File size cannot exceed 25 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");
      setUploadProgress(0);
      setUploadStage("Validating...");

      const response = await uploadDocument(selectedFile, (progress) => {
        setUploadProgress(progress);
        if (progress < 30) setUploadStage("Uploading...");
        else if (progress < 60) setUploadStage("Extracting text...");
        else if (progress < 90) setUploadStage("Generating embeddings...");
        else setUploadStage("Indexing in Qdrant...");
      });

      setResult(response.data);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStage("");
    }
  };

  return (
    <>
      <PageHeader
        title="Upload Documents"
        description="Add trusted medical PDF documents to your knowledge base. Files are processed locally and indexed using PubMedBERT embeddings."
      />

      <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        <FileDropzone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClear={handleClearFile}
          disabled={uploading}
        />

        {error && (
          <div style={{ marginTop: "var(--space-5)", padding: "var(--space-4)", background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)", borderRadius: "var(--radius-xl)" }}>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-danger)" }}>{error}</p>
          </div>
        )}

        {selectedFile && !uploading && !result && (
          <div style={{ marginTop: "var(--space-5)", display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={handleClearFile}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpload}>
              Upload Document
            </Button>
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
              <span>{uploadStage}</span>
              <span style={{ marginLeft: "auto" }}>{uploadProgress}%</span>
            </div>
          </div>
        )}

        {result && (
          <div className="upload-result">
            <CheckCircle2 className="upload-result-icon" />
            <h3>Upload Successful!</h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", textAlign: "center", marginBottom: "var(--space-4)" }}>
              {result.document_name}
            </p>
            <div className="upload-stats">
              <div>
                <strong style={{ display: "block", fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)" }}>
                  {result.pages_processed}
                </strong>
                <span>pages processed</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)" }}>
                  {result.chunks_stored}
                </strong>
                <span>chunks stored</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", marginTop: "var(--space-6)" }}>
              <Button variant="secondary" onClick={() => navigate("/documents")}>
                View Library
              </Button>
              <Button variant="primary" onClick={() => navigate("/ask")}>
                Ask a Question
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
