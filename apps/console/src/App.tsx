import { Routes, Route, Navigate } from "react-router";
import RequireAuth from "@/components/auth/RequireAuth";
import ConsoleLayout from "@/components/ConsoleLayout";
import ClientsPage from "@app/ClientsPage";
import ClientNewPage from "@app/ClientNewPage";
import ClientDetailPage from "@app/ClientDetailPage";

function App() {
  return (
    <Routes>
      {/* 콘솔 전 라우트는 로그인(쿠키 세션)을 요구 — 미인증 시 가드가 재로그인 안내 표시 */}
      <Route element={<RequireAuth />}>
        <Route element={<ConsoleLayout />}>
          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<ClientNewPage />} />
          <Route path="/clients/:clientId" element={<ClientDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
