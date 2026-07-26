import "./index.css";
import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import AskMedScope from "./pages/AskMedScope";
import UploadDocuments from "./pages/UploadDocuments";
import DocumentLibrary from "./pages/DocumentLibrary";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ask" element={<AskMedScope />} />
        <Route path="/upload" element={<UploadDocuments />} />
        <Route path="/documents" element={<DocumentLibrary />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;