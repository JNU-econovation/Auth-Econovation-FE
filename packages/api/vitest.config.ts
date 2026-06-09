import { defineConfig } from "vitest/config";

/**
 * packages/api 자체 테스트 설정.
 *
 * MSW 핸들러 계약 테스트(`src/mocks/*.integration.test.ts`)를 node 환경에서
 * msw/node 서버로 검증합니다. 앱(web/console)의 vitest 설정과 독립적이며,
 * 공유 mock 레이어가 단독으로도 회귀 없이 동작함을 보장합니다.
 */
export default defineConfig({
  test: {
    name: "api",
    include: ["src/**/*.integration.test.ts"],
    environment: "node",
    setupFiles: ["./src/mocks/test-setup.ts"],
  },
});
