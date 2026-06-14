import { apiClient } from "../../../client";
import type { ActiveStatus } from "../../types";
import type { AdminRole } from "../../../admin/types";

/**
 * @public
 * @category Constants
 * @description 현재 로그인 사용자 조회 API 경로 (`GET /api/v1/auth/me`)
 *
 * ⚠️ me 엔드포인트의 실제 경로는 SSO 백엔드 명세 미확정입니다(v2 명세 §2-5/§6 참조).
 * 콘솔의 인증 가드가 의존하는 계약이므로, 합리적 기본 경로로 우선 정의하고
 * 백엔드 확정 시 이 상수만 교체합니다.
 */
export const ME_API_PATH = "/api/v1/auth/me";

/**
 * @public
 * @category Types
 * @interface MeResponse
 * @description 현재 로그인 사용자(세션 주체)의 신원·역할. 인증 여부 판정과 사용자 영역 표기에 사용합니다.
 * @property {number} memberId - 회원 ID
 * @property {string} name - 이름
 * @property {string} loginId - 로그인 ID
 * @property {number} generation - 기수
 * @property {ActiveStatus} status - 활동 상태
 * @property {AdminRole} role - 역할(USER | ADMIN | SUPER_ADMIN)
 */
export interface MeResponse {
  memberId: number;
  name: string;
  loginId: string;
  generation: number;
  status: ActiveStatus;
  role: AdminRole;
}

/**
 * @public
 * @category Auth
 * @description 현재 로그인 사용자를 조회합니다. AT/RT는 HttpOnly 쿠키이므로 JS로 직접 읽을 수 없고,
 * 이 호출의 성공(200)/실패(401 등)로 인증 여부를 판정합니다. (쿠키는 `withCredentials`로 자동 전송)
 * @returns 현재 사용자 신원·역할
 * @example
 * const me = await getMeApi();
 * console.log(me.role); // "SUPER_ADMIN"
 */
export const getMeApi = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>(ME_API_PATH);
  return response.data;
};
