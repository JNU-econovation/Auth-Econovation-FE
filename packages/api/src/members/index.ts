import { apiClient } from "../client";
import type { ActiveStatus } from "../auth/types";

/**
 * @auth-econovation/api/members — 회원 정보 조회 API.
 *
 * `ids` 목록으로 회원 정보를 단건/다건 통합 조회합니다(`POST /api/v1/members/batch`).
 * 인증된 회원 본인이 호출하며, 존재하지 않는 ID는 결과에서 조용히 제외됩니다(역할·비밀번호 미반환).
 */

/**
 * @public
 * @category Constants
 * @description 회원 정보 조회 API 경로 (`POST /api/v1/members/batch`)
 */
export const MEMBERS_BATCH_API_PATH = "/api/v1/members/batch";

/**
 * @public
 * @category Types
 * @interface PublicMember
 * @description 외부 연동 회원 조회 뷰(역할·비밀번호 제외).
 * @property {number} memberId - 회원 ID
 * @property {string} name - 이름
 * @property {string} loginId - 로그인 ID
 * @property {number} generation - 기수
 * @property {ActiveStatus} status - 활동 상태
 */
export interface PublicMember {
  memberId: number;
  name: string;
  loginId: string;
  generation: number;
  status: ActiveStatus;
}

/**
 * @public
 * @category Types
 * @interface PostMembersBatchApiRequest
 * @description 회원 정보 조회 요청 바디.
 * @property {number[]} ids - 조회할 회원 ID 목록(1개 이상, 빈 배열 불가)
 */
export interface PostMembersBatchApiRequest {
  ids: number[];
}

/**
 * @public
 * @category Types
 * @description 회원 정보 조회 응답 타입(존재하는 회원만 포함된 배열).
 */
export type PostMembersBatchApiResponse = PublicMember[];

/**
 * @public
 * @category Members
 * @description `ids` 목록으로 회원 정보를 조회합니다. 단건도 동일 엔드포인트를 사용하며, 없는 ID는 결과에서 조용히 제외됩니다.
 * @param ids - 조회할 회원 ID 목록(빈 배열 불가)
 * @returns 존재하는 회원 정보 배열(0건이어도 200)
 * @example
 * const members = await postMembersBatchApi([1, 2, 42]);
 * console.log(members[0]?.name);
 */
export const postMembersBatchApi = async (
  ids: number[],
): Promise<PostMembersBatchApiResponse> => {
  const response = await apiClient.post<PostMembersBatchApiResponse>(
    MEMBERS_BATCH_API_PATH,
    { ids },
  );
  return response.data;
};
