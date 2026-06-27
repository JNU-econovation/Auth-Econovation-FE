import { useQuery } from "@tanstack/react-query";
import { CLIENTS_API_PATH, getClientsApi } from "@auth-econovation/api/clients";

/**
 * 본인 소유 클라이언트 목록 조회 훅(연결 라우트 포함, clientSecret 미반환).
 *
 * `GET /api/v1/clients`는 `{ clients }` 형태로 응답하므로, `select`로 배열만 꺼내
 * 소비 측이 곧바로 순회할 수 있게 합니다. 등록/수정 뮤테이션이 무효화하는 캐시 키와
 * 동일한 `CLIENTS_API_PATH`를 사용해 목록이 자동 갱신됩니다.
 */
const useSelfClientsQuery = () => {
  return useQuery({
    queryKey: [CLIENTS_API_PATH],
    queryFn: getClientsApi,
    select: (data) => data.clients,
  });
};

export default useSelfClientsQuery;
