import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareText, UploadCloud, Server, Database, Cpu, FileText, Layers } from "lucide-react";
import { useBackendHealth } from "../hooks/useBackendHealth";
import { listDocuments } from "../services/api";
import Button from "../components/ui/Button";
import MetricCard from "../components/cards/MetricCard";
import StatusCard from "../components/cards/StatusCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorState from "../components/ui/ErrorState";

export default function Dashboard() {
  const navigate = useNavigate();
  const { services, isLoading: healthLoading, refetch } = useBackendHealth();
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await listDocuments();
        setDocuments(response.data.documents || []);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setDocsLoading(false);
      }
    };

    if (services.api.healthy) {
      fetchDocuments();
    } else {
      setDocsLoading(false);
    }
  }, [services.api.healthy]);

  const totalDocuments = documents.length;
  const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunks_count || 0), 0);

  if (!healthLoading && !services.api.healthy) {
    return (
      <ErrorState
        title="Backend Offline"
        message="Unable to connect to MedScope API. Please ensure the backend is running on http://127.0.0.1:8000"
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <span className="eyebrow">Evidence-grounded intelligence</span>
            <h1>Medical research, made understandable.</h1>
            <p>
              Upload trusted literature, retrieve evidence and generate source-backed answers using BioMistral, PubMedBERT and Qdrant.
            </p>
            <div className="hero-actions">
              <Button variant="primary" size="lg" onClick={() => navigate("/ask")}>
                <MessageSquareText size={18} />
                Ask MedScope
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate("/upload")}>
                <UploadCloud size={18} />
                Upload PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-5)", color: "var(--color-text-primary)" }}>
          System Status
        </h2>
        <div className="grid grid-4">
          <StatusCard
            title="API Service"
            status={services.api.status}
            icon={Server}
            details={services.api.healthy ? "FastAPI running" : "Service unavailable"}
          />
          <StatusCard
            title="Qdrant Vector DB"
            status={services.qdrant.status}
            icon={Database}
            details={services.qdrant.healthy ? `${services.qdrant.points} points indexed` : "Database unavailable"}
          />
          <StatusCard
            title="Embedding Model"
            status={services.embedding.status}
            icon={Cpu}
            details={services.embedding.healthy ? `PubMedBERT (${services.embedding.dimension}d)` : "Model unavailable"}
          />
          <StatusCard
            title="Local LLM"
            status="online"
            icon={Layers}
            details="BioMistral-7B ready"
          />
        </div>
      </section>

      <section style={{ marginTop: "var(--space-10)" }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-5)", color: "var(--color-text-primary)" }}>
          Knowledge Base
        </h2>
        {healthLoading || docsLoading ? (
          <div className="metrics-grid">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
        ) : (
          <div className="metrics-grid">
            <MetricCard
              icon={FileText}
              label="Indexed Documents"
              value={totalDocuments}
              status={totalDocuments > 0 ? "online" : "warning"}
            />
            <MetricCard
              icon={Database}
              label="Vector Chunks"
              value={totalChunks.toLocaleString()}
              status={totalChunks > 0 ? "online" : "warning"}
            />
          </div>
        )}
      </section>

      {totalDocuments > 0 && (
        <section style={{ marginTop: "var(--space-10)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
            <h2 style={{ fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)" }}>
              Recent Documents
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/documents")}>
              View all →
            </Button>
          </div>
          <div className="card">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.file_hash}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  padding: "var(--space-4)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                }}
              >
                <FileText size={20} style={{ color: "var(--color-accent-teal)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                    {doc.document_name}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                    {doc.pages_count} pages · {doc.chunks_count} chunks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
