import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CLIENTS_API_PATH,
  postClientApi,
  type ClientApiRequest,
} from "@auth-econovation/api/clients";

/**
 * 본인 소유 OAuth 클라이언트 셀프 등록 뮤테이션.
 *
 * 성공 시 발급된 clientId·clientSecret(+선택 라우트)을 반환하고 내 클라이언트 목록 캐시를
 * 무효화합니다. `pathPrefix`+`upstreamUrl`을 함께 보내면 Gateway 라우트가 같은 트랜잭션에서
 * 생성됩니다.
 */
const usePostSelfClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [CLIENTS_API_PATH],
    mutationFn: (data: ClientApiRequest) => postClientApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_API_PATH] });
    },
  });
};

export default usePostSelfClient;
