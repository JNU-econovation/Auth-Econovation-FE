import { Routes, Route, Navigate } from "react-router";
import ConsoleLayout from "@/components/ConsoleLayout";
import ClientsPage from "@app/ClientsPage";
import ClientNewPage from "@app/ClientNewPage";
import ClientDetailPage from "@app/ClientDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<ConsoleLayout />}>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/new" element={<ClientNewPage />} />
        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
