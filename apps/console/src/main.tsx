import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { env } from "./env";
import { queryClient } from "./lib/queryClient";
import { MockRoleProvider } from "./lib/mockRole";
import { installMockRoleInterceptor } from "./lib/mockActor";

/**
 * `env.enableMsw`(VITE_ENABLE_MSW=true)일 때만 MSW 브라우저 워커를 시작합니다.
 * 콘솔은 아직 로컬 백엔드가 없어 개발 모드에서 공유 mock(@auth-econovation/api/mocks)으로
 * 구동하며, 이때 actor 역할 헤더 주입 인터셉터도 함께 설치합니다.
 * 프로덕션 빌드에서는 플래그가 꺼져 있어 워커/인터셉터가 동작하지 않습니다.
 *
 * `env` import 자체가 필수 환경변수(VITE_API_URL) 검증을 부팅 초기에 트리거합니다.
 */
async function enableMocking() {
  if (!env.enableMsw) return;
  installMockRoleInterceptor();
  const { worker } = await import("@auth-econovation/api/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MockRoleProvider>
            <App />
          </MockRoleProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});
