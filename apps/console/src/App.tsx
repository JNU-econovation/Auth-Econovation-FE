import { Routes, Route, Navigate } from "react-router";
import AdminLayout from "@/components/AdminLayout";
import ClientsPage from "@app/ClientsPage";
import MembersPage from "@app/MembersPage";

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/members" element={<MembersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
