import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { markForbidden, markUnauthenticated } from "@/lib/authStatus";

/**
 * 인증 실패(401/403) 응답이면 로그인이 필요한 상태로 보고 인증 스토어에 기록합니다.
 *
 * 콘솔은 토큰 기반이라 별도 인증 가드(과거의 me 조회) 없이, 어떤 요청이든 인증/인가
 * 실패로 응답하면 이 전역 핸들러가 상태를 바꾸고, 이를 구독하는 `AuthGate`가 본문 대신
 * 안내 화면을 띄웁니다. 자동 리다이렉트가 아니라 화면을 띄우는 이유: 사용자가 갑자기
 * 외부 로그인 페이지로 튕기지 않고, 안내를 본 뒤 버튼으로 직접 로그인하도록 하기 위함입니다.
 * 그 외 4xx(400 검증 실패·404 없음·409 충돌 등)는 기능별 에러 처리에 맡겨,
 * 폼 검증·리소스 없음 안내가 인증 안내로 가로채이지 않도록 합니다.
 */
const handleAuthFailure = (error: unknown): void => {
  if (!isAxiosError(error)) return;
  const status = error.response?.status;
  if (status === 401) markUnauthenticated();
  else if (status === 403) markForbidden();
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthFailure }),
  mutationCache: new MutationCache({ onError: handleAuthFailure }),
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
