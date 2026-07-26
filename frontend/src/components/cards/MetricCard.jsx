import LoadingSkeleton from "../ui/LoadingSkeleton";
import StatusBadge from "../ui/StatusBadge";

export default function MetricCard({ icon: Icon, label, value, status, loading = false }) {
  if (loading) {
    return (
      <div className="metric-card">
        <LoadingSkeleton type="card" />
      </div>
    );
  }

  return (
    <div className="metric-card">
      <div className="metric-header">
        {Icon && (
          <div className="metric-icon">
            <Icon size={20} />
          </div>
        )}
        {status && <StatusBadge status={status} />}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}
