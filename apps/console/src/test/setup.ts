import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "@auth-econovation/api/mocks/server";
import { resetDb } from "@auth-econovation/api/mocks";
import {
  installMockRoleInterceptor,
  setMockActorRole,
} from "@/lib/mockActor";

/**
 * 콘솔 통합 테스트 전역 setup.
 *
 * - 공유 mock(@auth-econovation/api/mocks): web과 동일한 MSW 핸들러/스토어 재사용.
 * - actor 역할 인터셉터: 어드민 엔드포인트는 `X-Mock-Role`로 권한을 판정하므로,
 *   공유 apiClient에 헤더 주입 인터셉터를 설치합니다(기본 SUPER_ADMIN).
 * - 각 테스트 후 DOM/핸들러/스토어/역할을 초기화해 테스트 간 격리를 보장합니다.
 */
installMockRoleInterceptor();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  setMockActorRole("SUPER_ADMIN");
});

afterAll(() => {
  server.close();
});
