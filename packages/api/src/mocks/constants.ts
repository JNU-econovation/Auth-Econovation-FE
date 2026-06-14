/**
 * MSW 핸들러 공통 상수.
 *
 * 경로 상수는 가능한 한 실제 API 레이어(`../auth/...`)의 상수를 재사용하고,
 * 아직 API 레이어가 없는 어드민/회원 엔드포인트만 여기서 정의합니다.
 * 핸들러는 baseURL(`VITE_API_URL`) 유무와 무관하게 매칭되도록 `*`(와일드카드)
 * 접두어를 붙여 사용합니다.
 */

export { SIGN_UP_API_PATH } from "../auth/v1/signup";
export { SIGN_IN_API_PATH } from "../auth/v1/login";
export { REISSUE_API_PATH } from "../auth/v1/reissue";
export { LOGOUT_API_PATH } from "../auth/v1/logout";
export { ME_API_PATH } from "../auth/v1/me";

/** 어드민 클라이언트 관리 베이스 경로 (`/api/v1/admin/clients`) */
export const ADMIN_CLIENTS_API_PATH = "/api/v1/admin/clients";

/** 어드민 회원 관리 베이스 경로 (`/api/v1/admin/members`) */
export const ADMIN_MEMBERS_API_PATH = "/api/v1/admin/members";

/** 외부 연동 회원 정보 조회 경로 (`/api/v1/members/batch`) */
export const MEMBERS_BATCH_API_PATH = "/api/v1/members/batch";

/**
 * 핸들러가 발급하는 모의 토큰 값.
 * reissue에서 RT 유효성을 판정할 때 이 값과의 일치 여부로 valid/invalid를 구분합니다.
 */
export const MOCK_ACCESS_TOKEN =
  "mock.at.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
export const MOCK_REFRESH_TOKEN =
  "mock.rt.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

/** 모의 AT 만료 시각(epoch millis). 실제 시간에 의존하지 않도록 고정값 사용. */
export const MOCK_ACCESS_EXPIRED_TIME = 1_900_000_000_000;

/**
 * 역할 가드용 모의 헤더.
 *
 * 실제 백엔드는 로그인 쿠키(JWT)에서 역할/회원ID를 추출하지만, 모킹 환경에는
 * JWT 검증 로직이 없으므로 요청자의 신원을 다음 헤더로 주입합니다.
 * - `X-Mock-Role`: 요청자 역할. 미지정 시 `SUPER_ADMIN`(권한 충족 = happy path).
 * - `X-Mock-Member-Id`: 요청자 회원 ID. 미지정 시 `1`. 본인 역할 변경 차단에 사용.
 */
export const MOCK_ROLE_HEADER = "X-Mock-Role";
export const MOCK_MEMBER_ID_HEADER = "X-Mock-Member-Id";
