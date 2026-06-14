import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getMeApi, ME_API_PATH } from "@auth-econovation/api";

/**
 * 현재 로그인 사용자(세션 주체) 조회 쿼리.
 *
 * AT/RT가 HttpOnly 쿠키라 JS로 직접 읽을 수 없으므로, 이 쿼리의 성공/실패로
 * 인증 여부를 판정합니다(`RequireAuth` 가드의 기준).
 *
 * 재시도 정책(v2 명세 §120): 401/403은 재시도해도 결과가 같으므로 즉시 확정하고,
 * 그 외(네트워크 단절·5xx 등 일시적 실패)만 1회 재시도해 깜빡임을 줄입니다.
 *
 * 같은 `queryKey`를 공유하므로 가드와 레이아웃이 동시에 호출해도 네트워크는 1회입니다.
 */
const useAuthMeQuery = () =>
  useQuery({
    queryKey: [ME_API_PATH],
    queryFn: getMeApi,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) return false;
      return failureCount < 1;
    },
  });

export default useAuthMeQuery;
