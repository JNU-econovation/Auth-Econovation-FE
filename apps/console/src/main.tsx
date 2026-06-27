import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@auth-econovation/ui";
import { setAuthTokenGetter } from "@auth-econovation/api";
import "./index.css";
import App from "./App.tsx";
import { env } from "./env";
import { queryClient } from "./lib/queryClient";
import {
  captureRedirectTokens,
  getStoredAccessToken,
} from "./lib/redirectTokens";

/**
 * `env.enableMsw`(VITE_ENABLE_MSW=true)일 때만 MSW 브라우저 워커를 시작합니다.
 * 콘솔은 아직 로컬 백엔드가 없어 개발 모드에서 공유 mock(@auth-econovation/api/mocks)으로
 * 구동합니다. 프로덕션 빌드에서는 플래그가 꺼져 있어 워커가 동작하지 않습니다.
 *
 * `env` import 자체가 필수 환경변수(VITE_API_URL) 검증을 부팅 초기에 트리거합니다.
 */
async function enableMocking() {
  if (!env.enableMsw) return;
  const { worker } = await import("@auth-econovation/api/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  // APP 리다이렉트로 진입했다면 URL 쿼리의 토큰을 localStorage로 옮기고 URL을 정리합니다(렌더 전 1회).
  captureRedirectTokens();
  // 콘솔은 토큰 기반: 이후 모든 API 요청에 localStorage의 AT를 Authorization 헤더로 주입합니다.
  setAuthTokenGetter(getStoredAccessToken);
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});
