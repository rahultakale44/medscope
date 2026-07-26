import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function StatusCard({ title, status, details, icon: Icon }) {
  const isOnline = status === "online" || status === "healthy";
  const StatusIcon = isOnline ? CheckCircle2 : status === "error" ? XCircle : AlertCircle;
  const statusColor = isOnline
    ? "var(--color-success)"
    : status === "error"
    ? "var(--color-danger)"
    : "var(--color-warning)";

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        {Icon && (
          <div className="metric-icon">
            <Icon size={20} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", marginBottom: "var(--space-1)" }}>
            {title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <StatusIcon size={14} style={{ color: statusColor }} />
            <span style={{ fontSize: "var(--font-size-xs)", color: statusColor }}>
              {isOnline ? "Online" : status === "error" ? "Offline" : "Warning"}
            </span>
          </div>
        </div>
      </div>
      {details && (
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          {details}
        </div>
      )}
    </div>
  );
}
