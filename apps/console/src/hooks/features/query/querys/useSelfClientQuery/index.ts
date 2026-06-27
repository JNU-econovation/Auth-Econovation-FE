import { useQuery } from "@tanstack/react-query";
import { CLIENT_API_PATH, getClientApi } from "@auth-econovation/api/clients";

interface UseSelfClientQueryProps {
  clientId: string;
  enabled?: boolean;
}

/**
 * 본인 소유 클라이언트 단건 조회 훅(연결 라우트 포함). clientId가 비어 있으면 비활성화됩니다.
 * 타인 소유·미존재 clientId는 404로 숨김 처리됩니다.
 */
const useSelfClientQuery = ({
  clientId,
  enabled = true,
}: UseSelfClientQueryProps) => {
  return useQuery({
    queryKey: [CLIENT_API_PATH(clientId)],
    queryFn: () => getClientApi(clientId),
    enabled: enabled && clientId.length > 0,
  });
};

export default useSelfClientQuery;
