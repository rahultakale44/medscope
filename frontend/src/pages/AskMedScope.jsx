import { useState } from "react";
import { Send, BookOpen, Loader2, Copy, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { queryMedical } from "../services/api";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import SourceCard from "../components/cards/SourceCard";
import MedicalDisclaimer from "../components/shared/MedicalDisclaimer";

const suggestions = [
  "What does the uploaded document recommend for hypertension treatment?",
  "What blood pressure targets are mentioned in the literature?",
  "When is combination therapy recommended according to the guidelines?",
];

export default function AskMedScope() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [grounded, setGrounded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [topK, setTopK] = useState(3);
  const [scoreThreshold, setScoreThreshold] = useState(0.2);
  const [loadingStage, setLoadingStage] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");
      setSources([]);
      setLoadingStage(1);

      setTimeout(() => setLoadingStage(2), 2000);
      setTimeout(() => setLoadingStage(3), 4000);

      const response = await queryMedical({
        question: cleanQuestion,
        top_k: topK,
        score_threshold: scoreThreshold,
      });

      setAnswer(response.data.answer || "No answer generated.");
      setSources(response.data.sources || []);
      setGrounded(Boolean(response.data.grounded));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate answer.");
    } finally {
      setLoading(false);
      setLoadingStage(0);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setAnswer("");
    setSources([]);
    setError("");
    setGrounded(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
  };

  return (
    <div className="ask-layout">
      <div className="question-panel">
        <h2>Ask a question</h2>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-5)" }}>
          Enter a question related to your uploaded medical documents.
        </p>

        <form onSubmit={handleSubmit} className="question-form">
          <textarea
            className="form-textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What treatment does the document recommend for hypertension?"
            rows={8}
            disabled={loading}
            maxLength={1000}
          />

          <div className="form-footer">
            <span className="char-count">{question.length}/1000</span>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <Button type="button" variant="ghost" onClick={handleClear} disabled={loading || !question}>
                Clear
              </Button>
              <Button type="submit" variant="primary" loading={loading} disabled={!question.trim()}>
                <Send size={16} />
                Ask MedScope
              </Button>
            </div>
          </div>
        </form>

        <div className="suggestions-section">
          <div className="suggestions-title">Suggested questions</div>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="suggestion-button"
              onClick={() => setQuestion(suggestion)}
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="advanced-settings">
          <button
            type="button"
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            <span>Advanced Settings</span>
            {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showSettings && (
            <div className="settings-content">
              <div className="form-group">
                <label className="form-label">Top K Results: {topK}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Score Threshold: {scoreThreshold}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="answer-panel">
        {!loading && !answer && !error && (
          <div className="loading-container">
            <BookOpen className="loading-icon" style={{ animation: "none" }} />
            <h3 className="loading-title">Your answer will appear here</h3>
            <p className="loading-message">
              The generated response will include grounding status and document sources with similarity scores.
            </p>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <Loader2 className="loading-icon" style={{ animation: "spin 0.8s linear infinite" }} />
            <h3 className="loading-title">Reviewing literature</h3>
            <p className="loading-message">
              Local BioMistral inference may take 30–90 seconds. Please wait...
            </p>
            <div className="loading-stages">
              <div className={`loading-stage ${loadingStage >= 1 ? "active" : ""}`}>
                <Loader2 size={16} style={{ animation: loadingStage >= 1 ? "spin 0.8s linear infinite" : "none" }} />
                <span>Searching indexed literature</span>
              </div>
              <div className={`loading-stage ${loadingStage >= 2 ? "active" : ""}`}>
                <Loader2 size={16} style={{ animation: loadingStage >= 2 ? "spin 0.8s linear infinite" : "none" }} />
                <span>Ranking relevant evidence</span>
              </div>
              <div className={`loading-stage ${loadingStage >= 3 ? "active" : ""}`}>
                <Loader2 size={16} style={{ animation: loadingStage >= 3 ? "spin 0.8s linear infinite" : "none" }} />
                <span>Generating grounded response</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "var(--space-5)", background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)", borderRadius: "var(--radius-xl)" }}>
            <h3 style={{ color: "var(--color-danger)", marginBottom: "var(--space-2)" }}>Request Failed</h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{error}</p>
          </div>
        )}

        {answer && !loading && (
          <>
            <div className="answer-header">
              <div>
                <span className="eyebrow">Generated Response</span>
                <h3 style={{ fontSize: "var(--font-size-xl)", marginTop: "var(--space-2)" }}>Evidence-grounded answer</h3>
              </div>
              <StatusBadge status={grounded ? "grounded" : "limited"} />
            </div>

            <div className="answer-text">{answer}</div>

            <div className="answer-actions">
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                <Copy size={14} />
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <RotateCcw size={14} />
                New Question
              </Button>
            </div>

            {sources.length > 0 && (
              <div className="sources-section">
                <div className="sources-header">
                  <BookOpen size={18} />
                  <span>Sources ({sources.length})</span>
                </div>
                {sources.map((source, index) => (
                  <SourceCard key={`${source.document_name}-${index}`} source={source} index={index + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <MedicalDisclaimer />
    </div>
  );
}
