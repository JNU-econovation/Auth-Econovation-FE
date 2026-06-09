import { defineConfig } from "vitest/config";
import path from "path";

/**
 * 메인 앱(vite.config.ts)과 동일한 경로 alias.
 * 두 테스트 프로젝트가 공유하도록 한 곳에서 정의합니다.
 */
const alias = {
  "@": path.resolve(__dirname, "./src"),
  "@app": path.resolve(__dirname, "./src/app"),
};

export default defineConfig({
  resolve: { alias },
  test: {
    /**
     * 테스트를 두 프로젝트로 분리합니다.
     * - unit: 순수 함수/유틸. 가볍고 빠른 node 환경.
     * - integration: 컴포넌트 렌더 + MSW API 모킹(@auth-econovation/api/mocks). jsdom + 전역 setup.
     */
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          include: ["src/__tests__/**/*.test.ts"],
          environment: "node",
          pool: "forks",
        },
      },
      {
        resolve: { alias },
        test: {
          name: "integration",
          include: ["src/**/*.integration.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
    ],
  },
});
