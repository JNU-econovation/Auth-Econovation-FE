import { apiClient } from "../../client";
import type { AdminMember, AdminRole, PageResponse } from "../types";

/**
 * @public
 * @category Constants
 * @description 어드민 회원 목록 조회 API 경로 (`GET /api/v1/admin/members`)
 */
export const ADMIN_MEMBERS_API_PATH = "/api/v1/admin/members";

/**
 * @public
 * @category Constants
 * @description 회원 역할 변경 API 경로를 생성하는 함수 (`PATCH /api/v1/admin/members/{memberId}/role`)
 * @param memberId - 회원 ID
 * @returns API 경로 문자열
 */
export const ADMIN_MEMBER_ROLE_API_PATH = (memberId: number) =>
  `/api/v1/admin/members/${memberId}/role`;

/**
 * @public
 * @category Types
 * @interface GetAdminMembersApiParams
 * @description 회원 목록 조회 쿼리 파라미터
 * @property {number} [page] - 페이지(0-base, 기본 0)
 * @property {number} [size] - 페이지 크기(기본 20)
 * @property {AdminRole} [role] - 역할 필터(선택)
 */
export interface GetAdminMembersApiParams {
  page?: number;
  size?: number;
  role?: AdminRole;
}

/**
 * @public
 * @category Types
 * @description 회원 목록 조회 응답 타입(페이지네이션 + 회원 뷰)
 */
export type GetAdminMembersApiResponse = PageResponse<AdminMember>;

/**
 * @public
 * @category AdminMembers
 * @description 어드민 회원 목록을 페이지네이션으로 조회합니다. `ADMIN` 이상 권한 필요.
 * @param params - 페이지/크기/역할 필터(선택)
 * @returns 회원 목록 페이지 응답
 * @example
 * const page = await getAdminMembersApi({ page: 0, size: 20, role: "ADMIN" });
 * console.log(page.content, page.totalElements);
 */
export const getAdminMembersApi = async (
  params: GetAdminMembersApiParams = {},
): Promise<GetAdminMembersApiResponse> => {
  // falsy role("" 등)은 쿼리스트링에서 제거해 API 계약을 자기방어적으로 만듭니다.
  const { role, ...rest } = params;
  const response = await apiClient.get<GetAdminMembersApiResponse>(
    ADMIN_MEMBERS_API_PATH,
    { params: { ...rest, ...(role ? { role } : {}) } },
  );
  return response.data;
};

/**
 * @public
 * @category Types
 * @interface PatchAdminMemberRoleApiResponse
 * @description 역할 변경 응답 타입
 * @property {number} memberId - 회원 ID
 * @property {AdminRole} role - 변경된 역할
 */
export interface PatchAdminMemberRoleApiResponse {
  memberId: number;
  role: AdminRole;
}

/**
 * @public
 * @category AdminMembers
 * @description 회원의 역할을 변경합니다. **SUPER_ADMIN 전용**. 본인/마지막 SUPER_ADMIN은 변경 불가.
 * @param memberId - 대상 회원 ID
 * @param role - 변경할 역할 (USER | ADMIN | SUPER_ADMIN)
 * @returns 변경된 회원 ID와 역할
 * @example
 * const result = await patchAdminMemberRoleApi(3, "ADMIN");
 * console.log(result.role); // "ADMIN"
 */
export const patchAdminMemberRoleApi = async (
  memberId: number,
  role: AdminRole,
): Promise<PatchAdminMemberRoleApiResponse> => {
  const response = await apiClient.patch<PatchAdminMemberRoleApiResponse>(
    ADMIN_MEMBER_ROLE_API_PATH(memberId),
    { role },
  );
  return response.data;
};
