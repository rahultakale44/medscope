import { Activity, RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";

const pageInfo = {
  "/": {
    title: "Dashboard",
    description: "Monitor your medical knowledge workspace",
  },
  "/ask": {
    title: "Ask MedScope",
    description: "Generate grounded answers from uploaded literature",
  },
  "/upload": {
    title: "Upload Documents",
    description: "Add trusted medical PDF documents",
  },
  "/documents": {
    title: "Document Library",
    description: "Manage indexed medical literature",
  },
};

export default function Header({ onRefresh, showRefresh, statusOnline = true }) {
  const { pathname } = useLocation();
  const page = pageInfo[pathname] || pageInfo["/"];

  return (
    <header className="app-header">
      <div className="header-info">
        <h2>{page.title}</h2>
        <p>{page.description}</p>
      </div>

      <div className="header-actions">
        {showRefresh && onRefresh && (
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onRefresh}
            aria-label="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        )}

        <div className={`badge ${statusOnline ? "badge-success" : "badge-danger"}`}>
          <Activity size={12} />
          <span>{statusOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
    </header>
  );
}
