import { CheckCircle2, AlertCircle, XCircle, Info, X } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export default function Toast({ toast, onClose }) {
  const Icon = icons[toast.type] || Info;

  return (
    <div className="toast">
      <Icon className="toast-icon" style={{ color: `var(--color-${toast.type})` }} />
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={() => onClose(toast.id)}
        style={{ padding: "var(--space-1)" }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
