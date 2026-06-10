import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_CLIENTS_API_PATH,
  getAdminClientsApi,
} from "@auth-econovation/api/admin";

/**
 * 등록된 클라이언트 목록 조회 쿼리.
 *
 * ⚠️ 백엔드 목록 엔드포인트는 명세 미확정으로(단건 조회만 계약 존재), 현재는 MSW mock에
 * 의존합니다(db.clients 전체 반환). 실제 계약 확정 시 `getAdminClientsApi`와 함께 조정합니다.
 */
const useAdminClientsQuery = () => {
  return useQuery({
    queryKey: [ADMIN_CLIENTS_API_PATH],
    queryFn: getAdminClientsApi,
  });
};

export default useAdminClientsQuery;
