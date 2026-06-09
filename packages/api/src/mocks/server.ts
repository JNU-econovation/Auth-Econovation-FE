import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * Node(테스트) 환경용 MSW 서버 인스턴스.
 * lifecycle(listen/resetHandlers/close)은 `src/test/setup.ts`에서 전역으로 관리합니다.
 */
export const server = setupServer(...handlers);
