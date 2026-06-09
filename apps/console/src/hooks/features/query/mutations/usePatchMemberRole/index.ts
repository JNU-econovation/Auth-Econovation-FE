import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_MEMBERS_API_PATH,
  ADMIN_MEMBER_ROLE_API_PATH,
  patchAdminMemberRoleApi,
  type AdminRole,
} from "@auth-econovation/api/admin";

interface UsePatchMemberRoleParams {
  memberId: number;
  role: AdminRole;
}

/**
 * 회원 역할 변경 뮤테이션(SUPER_ADMIN 전용). 성공 시 회원 목록 캐시를 무효화합니다.
 */
const usePatchMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ADMIN_MEMBER_ROLE_API_PATH],
    mutationFn: ({ memberId, role }: UsePatchMemberRoleParams) =>
      patchAdminMemberRoleApi(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_MEMBERS_API_PATH] });
    },
  });
};

export default usePatchMemberRole;
