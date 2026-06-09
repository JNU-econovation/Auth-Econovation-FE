import type { ActiveStatus } from "../auth/types";

/**
 * @public
 * @category Types
 * @description 어드민/회원 역할. SSO 백엔드 명세(`admin-ui.md`)의 역할 위계.
 */
export type AdminRole = "USER" | "ADMIN" | "SUPER_ADMIN";

/**
 * @public
 * @category Types
 * @interface AdminMember
 * @description 어드민 회원 목록/상세 뷰(역할 포함, 비밀번호 제외).
 * @property {number} memberId - 회원 ID
 * @property {string} name - 이름
 * @property {string} loginId - 로그인 ID
 * @property {number} generation - 기수
 * @property {ActiveStatus} status - 활동 상태
 * @property {AdminRole} role - 역할
 */
export interface AdminMember {
  memberId: number;
  name: string;
  loginId: string;
  generation: number;
  status: ActiveStatus;
  role: AdminRole;
}

/**
 * @public
 * @category Types
 * @interface PageResponse
 * @description 페이지네이션 응답 공통 형태(Spring Page 정렬).
 * @property {T[]} content - 현재 페이지 항목
 * @property {number} totalElements - 전체 항목 수
 * @property {number} totalPages - 전체 페이지 수
 * @property {number} page - 현재 페이지(0-base)
 * @property {number} size - 페이지 크기
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/**
 * @public
 * @category Types
 * @interface AdminClient
 * @description OAuth 클라이언트 상세(클라이언트 ID·이름·리다이렉트 URI 목록).
 * @property {string} clientId - 클라이언트 ID
 * @property {string} clientName - 클라이언트 이름
 * @property {string[]} redirectUris - 등록된 redirect URI 목록
 */
export interface AdminClient {
  clientId: string;
  clientName: string;
  redirectUris: string[];
}
