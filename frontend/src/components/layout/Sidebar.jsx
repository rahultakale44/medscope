import {
  LayoutDashboard,
  MessageSquareText,
  UploadCloud,
  FileSearch,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ask", label: "Ask MedScope", icon: MessageSquareText },
  { path: "/upload", label: "Upload Documents", icon: UploadCloud },
  { path: "/documents", label: "Document Library", icon: FileSearch },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-mark">M</div>
          <div className="brand-text">
            <h1>MedScope</h1>
            <p>Medical Evidence Engine</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Workspace</div>
        <div className="nav-items">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-indicator" />
          <div className="status-text">
            <strong>Local and private</strong>
            <span>BioMistral · Qdrant</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
