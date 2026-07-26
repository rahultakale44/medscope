import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = 24, className = "" }) {
  return (
    <Loader2
      size={size}
      className={`spinner ${className}`}
      style={{ animation: "spin 0.8s linear infinite" }}
    />
  );
}
