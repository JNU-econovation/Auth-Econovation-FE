/**
 * @public
 * @category Types
 * @description 회원 활동 상태. SSO 백엔드 명세의 `status` 필드 값.
 */
export type ActiveStatus = "AM" | "RM" | "CM" | "OB";

/**
 * @public
 * @category Types
 * @description 로그인/재발급/로그아웃 동작을 구분하는 클라이언트 타입.
 * - `WEB`: AT/RT를 HttpOnly 쿠키로 발급/관리
 * - `APP`: AT/RT를 response body로 주고받음
 */
export type ClientType = "WEB" | "APP";

/**
 * @public
 * @category Types
 * @interface SignUpRequest
 * @description 회원 가입 요청 바디 (`POST /api/v1/auth/signup`)
 * @property {string} name - 이름 (1~50자)
 * @property {string} loginId - 로그인 ID (영문/숫자/`-_.` 조합 3~19자)
 * @property {string} password - 비밀번호 (8~19자)
 * @property {number} generation - 기수 (1~99)
 * @property {ActiveStatus} status - 활동 상태
 */
export interface SignUpRequest {
  name: string;
  loginId: string;
  password: string;
  generation: number;
  status: ActiveStatus;
}

/**
 * @public
 * @category Types
 * @interface SignInRequest
 * @description 로그인 요청 바디 (`POST /api/v1/auth/login`)
 * @property {string} loginId - 로그인 ID
 * @property {string} password - 비밀번호
 */
export interface SignInRequest {
  loginId: string;
  password: string;
}

/**
 * @public
 * @category Types
 * @interface SignInResponse
 * @description 로그인 응답 바디. WEB은 만료 시각만, APP은 토큰까지 포함.
 * @property {number} accessExpiredTime - AT 만료 시각 (epoch millis)
 * @property {string} [accessToken] - Access Token (APP 전용)
 * @property {string} [refreshToken] - Refresh Token (APP 전용)
 */
export interface SignInResponse {
  accessExpiredTime: number;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * @public
 * @category Types
 * @interface ReissueRequest
 * @description AT/RT 재발급 요청 바디 (`POST /api/v1/auth/reissue`).
 * APP에서만 `refreshToken`을 담아 전송하고, WEB은 쿠키(`rt`)로 자동 전송하므로 비워둡니다.
 * @property {string} [refreshToken] - Refresh Token (APP 전용)
 */
export interface ReissueRequest {
  refreshToken?: string;
}

/**
 * @public
 * @category Types
 * @description AT/RT 재발급 응답 바디. 로그인 응답과 동일한 형태.
 */
export type ReissueResponse = SignInResponse;

/**
 * @public
 * @category Types
 * @interface ApiErrorResponse
 * @description SSO 백엔드 공통 에러 응답 바디. `context/sso-api/common.md` 명세와 1:1로 정렬됩니다.
 * @property {string} errorCode - 명세 에러 코드 (예: `INVALID_CREDENTIALS`, `MEMBER_ALREADY_EXISTS`)
 * @property {string} message - 사용자 표시용 메시지
 * @property {string} timestamp - 에러 발생 시각 (예: `2026-06-03T18:00:00`)
 */
export interface ApiErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
}
