import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useBackendHealth } from "../../hooks/useBackendHealth";

export default function AppShell() {
  const { isHealthy, refetch } = useBackendHealth();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Header statusOnline={isHealthy} onRefresh={refetch} showRefresh />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
