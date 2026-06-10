import { Routes, Route, Navigate } from "react-router";
import AdminLayout from "@/components/AdminLayout";
import ClientsPage from "@app/ClientsPage";

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
