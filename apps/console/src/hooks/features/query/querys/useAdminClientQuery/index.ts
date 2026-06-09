import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_CLIENT_API_PATH,
  getAdminClientApi,
} from "@auth-econovation/api/admin";

interface UseAdminClientQueryProps {
  clientId: string;
  enabled?: boolean;
}

/**
 * 클라이언트 단건 조회 훅. clientId가 비어 있으면 비활성화됩니다.
 */
const useAdminClientQuery = ({
  clientId,
  enabled = true,
}: UseAdminClientQueryProps) => {
  return useQuery({
    queryKey: [ADMIN_CLIENT_API_PATH(clientId)],
    queryFn: () => getAdminClientApi(clientId),
    enabled: enabled && clientId.length > 0,
  });
};

export default useAdminClientQuery;
