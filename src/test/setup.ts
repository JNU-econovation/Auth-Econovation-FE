import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

/**
 * 통합 테스트 전역 setup.
 *
 * - `@testing-library/jest-dom/vitest`: `toBeInTheDocument` 등 DOM matcher 등록
 * - MSW 서버: 모든 테스트 시작 전 1회 listen, 각 테스트 후 핸들러 초기화, 종료 시 close
 * - RTL `cleanup`: 각 테스트 후 렌더된 DOM을 정리해 테스트 간 격리를 보장
 *
 * `onUnhandledRequest: "error"`로 설정해 모킹되지 않은 외부 요청이 새어 나가면
 * 테스트가 실패하도록 합니다(의도치 않은 실네트워크 호출 차단).
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
