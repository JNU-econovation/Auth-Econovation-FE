import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_CLIENT_API_PATH,
  deleteAdminClientRedirectUriApi,
} from "@auth-econovation/api/admin";

interface UseDeleteClientRedirectUriParams {
  clientId: string;
  uri: string;
}

/**
 * 클라이언트 redirect URI 삭제 뮤테이션. 성공 시 해당 클라이언트 조회 캐시를 무효화합니다.
 */
const useDeleteClientRedirectUri = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, uri }: UseDeleteClientRedirectUriParams) =>
      deleteAdminClientRedirectUriApi(clientId, uri),
    onSuccess: (_data, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_CLIENT_API_PATH(clientId)],
      });
    },
  });
};

export default useDeleteClientRedirectUri;
