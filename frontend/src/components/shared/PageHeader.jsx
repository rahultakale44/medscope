export default function PageHeader({ title, description, action }) {
  return (
    <div style={{ marginBottom: "var(--space-8)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-6)" }}>
        <div>
          <span className="eyebrow">MedScope</span>
          <h1 style={{ fontSize: "var(--font-size-4xl)", fontWeight: "var(--font-weight-bold)", marginBottom: "var(--space-3)" }}>
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)", maxWidth: "700px", lineHeight: "var(--line-height-relaxed)" }}>
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
