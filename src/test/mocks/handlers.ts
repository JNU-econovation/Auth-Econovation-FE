import { http, HttpResponse } from "msw";
import { SIGN_IN_API_PATH } from "@/api/auth/v1/login";
import type { ApiErrorResponse, SignInResponse } from "@/api/auth/types";

/**
 * MSW 기본 핸들러 모음.
 *
 * baseURL(`VITE_API_URL`)이 비어 있는 테스트 환경에서는 axios가 jsdom의
 * `window.location.origin` 기준 상대 경로로 요청하므로, 호스트에 의존하지 않도록
 * `*`(와일드카드)로 경로를 매칭합니다. 개별 테스트에서 `server.use(...)`로
 * 이 기본 응답을 덮어써 에러/엣지 케이스를 시뮬레이션할 수 있습니다.
 */

/**
 * 로그인 성공 기본 응답(WEB). AT/RT는 HttpOnly 쿠키로 발급된다고 가정하므로
 * 바디에는 만료 시각만 포함합니다.
 */
export const LOGIN_SUCCESS_RESPONSE: SignInResponse = {
  accessExpiredTime: 1_900_000_000_000,
};

/**
 * 잘못된 자격 증명 에러 응답 예시.
 */
export const LOGIN_INVALID_CREDENTIALS: ApiErrorResponse = {
  status: 401,
  message: "아이디 또는 비밀번호가 올바르지 않습니다.",
  code: 4001,
};

export const handlers = [
  http.post(`*${SIGN_IN_API_PATH}`, () => {
    return HttpResponse.json(LOGIN_SUCCESS_RESPONSE);
  }),
];
