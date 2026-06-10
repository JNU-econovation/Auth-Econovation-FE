import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_CLIENT_API_PATH,
  putAdminClientRedirectUrisApi,
} from "@auth-econovation/api/admin";

interface UsePutClientRedirectUrisParams {
  clientId: string;
  uris: string[];
}

/**
 * 클라이언트 redirect URI 전체 교체 뮤테이션. 성공 시 해당 클라이언트 조회 캐시를 무효화합니다.
 */
const usePutClientRedirectUris = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, uris }: UsePutClientRedirectUrisParams) =>
      putAdminClientRedirectUrisApi(clientId, uris),
    onSuccess: (_data, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_CLIENT_API_PATH(clientId)],
      });
    },
  });
};

export default usePutClientRedirectUris;
