import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_MEMBERS_API_PATH,
  getAdminMembersApi,
  type GetAdminMembersApiParams,
} from "@auth-econovation/api/admin";

/**
 * 어드민 회원 목록 조회 훅(페이지네이션 + 역할 필터).
 * key는 API 경로 + 파라미터로 구성해 페이지/필터별 캐시를 분리합니다.
 */
const useAdminMembersQuery = (params: GetAdminMembersApiParams = {}) => {
  return useQuery({
    queryKey: [ADMIN_MEMBERS_API_PATH, params],
    queryFn: () => getAdminMembersApi(params),
  });
};

export default useAdminMembersQuery;
