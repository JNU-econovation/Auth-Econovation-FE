import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_CLIENT_API_PATH,
  postAdminClientRedirectUriApi,
} from "@auth-econovation/api/admin";

interface UsePostClientRedirectUriParams {
  clientId: string;
  uri: string;
}

/**
 * 클라이언트 redirect URI 추가 뮤테이션. 성공 시 해당 클라이언트 조회 캐시를 무효화합니다.
 */
const usePostClientRedirectUri = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, uri }: UsePostClientRedirectUriParams) =>
      postAdminClientRedirectUriApi(clientId, uri),
    onSuccess: (_data, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_CLIENT_API_PATH(clientId)],
      });
    },
  });
};

export default usePostClientRedirectUri;
