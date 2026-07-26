export default function SourceCard({ source, index }) {
  const score = (source.score * 100).toFixed(1);

  return (
    <div className="source-card">
      <div className="source-number">{index}</div>
      <div className="source-info">
        <div className="source-name">{source.document_name}</div>
        <div className="source-meta">
          Page {source.page_number} · Chunk {source.chunk_index}
        </div>
      </div>
      <div className="source-score">{score}%</div>
    </div>
  );
}
