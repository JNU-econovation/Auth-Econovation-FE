import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CLIENT_API_PATH,
  CLIENTS_API_PATH,
  putClientApi,
  type ClientApiRequest,
} from "@auth-econovation/api/clients";

interface UsePutSelfClientParams {
  clientId: string;
  data: ClientApiRequest;
}

/**
 * 본인 소유 클라이언트 전체 표현 교체 뮤테이션(`PUT /api/v1/clients/{clientId}`).
 *
 * clientName·redirectUris(+선택 라우트)를 통째로 보내면 백엔드가 diff하여 반영합니다.
 * 라우트를 생략하면 기존 라우트가 삭제되므로, 라우트를 유지하려면 항상 함께 전달해야 합니다.
 * 성공 시 해당 클라이언트 단건·목록 캐시를 무효화합니다.
 */
const usePutSelfClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }: UsePutSelfClientParams) =>
      putClientApi(clientId, data),
    onSuccess: (_data, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: [CLIENT_API_PATH(clientId)],
      });
      queryClient.invalidateQueries({ queryKey: [CLIENTS_API_PATH] });
    },
  });
};

export default usePutSelfClient;
