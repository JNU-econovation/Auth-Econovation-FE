import { Routes, Route, Navigate } from "react-router";
import AuthGate from "@/components/auth/AuthGate";
import ConsoleLayout from "@/components/ConsoleLayout";
import ClientsPage from "@app/ClientsPage";
import ClientNewPage from "@app/ClientNewPage";
import ClientDetailPage from "@app/ClientDetailPage";

function App() {
  return (
    <Routes>
      {/* 토큰 기반 인증 — 진입은 막지 않고, 어떤 요청이든 401/403이면 queryClient 전역
          핸들러가 인증 스토어에 기록하고 AuthGate가 본문 대신 안내 화면을 띄웁니다
          (자동 리다이렉트 대신 사용자가 버튼으로 직접 로그인). */}
      <Route element={<AuthGate />}>
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
