import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_CLIENTS_API_PATH,
  postAdminClientApi,
  type PostAdminClientApiRequest,
} from "@auth-econovation/api/admin";

/**
 * OAuth 클라이언트 등록 뮤테이션. 성공 시 발급된 clientId를 반환하고 목록 캐시를 무효화합니다.
 */
const usePostClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ADMIN_CLIENTS_API_PATH],
    mutationFn: (data: PostAdminClientApiRequest) => postAdminClientApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CLIENTS_API_PATH] });
    },
  });
};

export default usePostClient;
