import type { ApiErrorResponse, SignInResponse } from "../auth/types";
import { MOCK_REDIRECT_URL } from "./constants";
import { authHandlers } from "./auth.handlers";
import { adminClientsHandlers } from "./adminClients.handlers";
import { adminMembersHandlers } from "./adminMembers.handlers";
import { adminRoutesHandlers } from "./adminRoutes.handlers";
import { membersHandlers } from "./members.handlers";
import { selfClientsHandlers } from "./selfClients.handlers";

/**
 * MSW 핸들러 집계.
 *
 * SSO 백엔드 명세(`context/sso-api/`)의 모든 엔드포인트를 그룹별 파일로 분리해 구현하고,
 * 여기서 하나로 모읍니다. 상태 변경 엔드포인트는 `./db`의 인메모리 스토어를 공유하며,
 * 테스트 간 격리는 `src/test/setup.ts`의 `resetDb()`로 보장합니다.
 *
 * 핸들러는 baseURL(`VITE_API_URL`) 유무와 무관하게 매칭되도록 `*`(와일드카드) 접두어를
 * 사용합니다. 개별 테스트에서 `server.use(...)`로 특정 응답을 덮어써 엣지 케이스를
 * 시뮬레이션할 수 있습니다.
 *
 * 역할 기반 가드(어드민 엔드포인트)는 `X-Mock-Role` / `X-Mock-Member-Id` 헤더로
 * 요청자 신원을 주입합니다(`./actor` 참조). 헤더 미지정 시 SUPER_ADMIN(id 1)이 기본값.
 */
export const handlers = [
  ...authHandlers,
  ...adminClientsHandlers,
  ...adminMembersHandlers,
  ...adminRoutesHandlers,
  ...membersHandlers,
  ...selfClientsHandlers,
];

/**
 * 로그인 성공 기본 응답(WEB). AT/RT는 HttpOnly 쿠키로 발급된다고 가정하므로
 * 바디에는 만료 시각과 리다이렉트 URL만 포함합니다.
 *
 * @deprecated 신규 코드는 `./constants`의 `MOCK_ACCESS_EXPIRED_TIME`을 사용하세요.
 * 기존 통합 테스트(`LoginFormSection`)와의 호환을 위해 유지합니다.
 */
export const LOGIN_SUCCESS_RESPONSE: SignInResponse = {
  accessExpiredTime: 1_900_000_000_000,
  redirectUrl: MOCK_REDIRECT_URL,
};

/**
 * 잘못된 자격 증명 에러 응답 예시(명세 정렬 스키마 `{ errorCode, message, timestamp }`).
 *
 * 신규 코드는 `./errors`의 `errorResponse("INVALID_CREDENTIALS")`를 사용하세요.
 * 이 상수는 `LoginFormSection` 통합 테스트의 편의를 위해 유지합니다.
 */
export const LOGIN_INVALID_CREDENTIALS: ApiErrorResponse = {
  errorCode: "INVALID_CREDENTIALS",
  message: "아이디 또는 비밀번호가 올바르지 않습니다.",
  timestamp: "2026-06-03T18:00:00",
};
