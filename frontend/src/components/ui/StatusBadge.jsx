import { CheckCircle2, AlertCircle, XCircle, Shield } from "lucide-react";

const statusConfig = {
  online: {
    icon: CheckCircle2,
    variant: "success",
    label: "Online",
  },
  offline: {
    icon: XCircle,
    variant: "danger",
    label: "Offline",
  },
  grounded: {
    icon: Shield,
    variant: "success",
    label: "Grounded",
  },
  limited: {
    icon: AlertCircle,
    variant: "warning",
    label: "Limited Evidence",
  },
  warning: {
    icon: AlertCircle,
    variant: "warning",
    label: "Warning",
  },
};

export default function StatusBadge({ status, label, showIcon = true }) {
  const config = statusConfig[status] || statusConfig.warning;
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <span className={`badge badge-${config.variant}`}>
      {showIcon && <Icon size={12} />}
      <span>{displayLabel}</span>
    </span>
  );
}
