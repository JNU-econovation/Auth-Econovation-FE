import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "@auth-econovation/api/mocks/server";
import { resetDb } from "@auth-econovation/api/mocks";

/**
 * 콘솔 통합 테스트 전역 setup.
 *
 * - 공유 mock(@auth-econovation/api/mocks): web과 동일한 MSW 핸들러/스토어 재사용.
 * - 각 테스트 후 DOM/핸들러/스토어를 초기화해 테스트 간 격리를 보장합니다.
 *
 * 어드민 엔드포인트는 `X-Mock-Role` 헤더 미주입 시 SUPER_ADMIN(id 1)으로 폴백되므로,
 * 클라이언트 관리 통합 테스트는 별도 역할 설정 없이 동작합니다.
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
});

afterAll(() => {
  server.close();
});
