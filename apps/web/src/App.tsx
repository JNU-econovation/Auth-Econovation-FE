import { Routes, Route, Navigate } from "react-router";
import LoginPage from "@app/LoginPage";
import SignUpPage from "@app/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/sign-in" element={<SignUpPage />} />
      {/* 정의되지 않은 모든 경로는 루트로 리다이렉트 (replace로 히스토리에 잘못된 주소를 남기지 않음) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
