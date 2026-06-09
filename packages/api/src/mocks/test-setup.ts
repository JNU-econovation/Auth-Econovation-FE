import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";
import { resetDb } from "./db";

/**
 * packages/api MSW 핸들러 계약 테스트용 전역 setup.
 *
 * 앱(web/console)의 통합 테스트 setup과 독립적으로, 공유 mock 레이어를 패키지 단독으로
 * 검증합니다. 모든 테스트 시작 전 1회 listen, 각 테스트 후 핸들러/스토어 초기화, 종료 시 close.
 * `onUnhandledRequest: "error"`로 모킹되지 않은 외부 요청을 차단합니다.
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  resetDb();
});

afterAll(() => {
  server.close();
});
