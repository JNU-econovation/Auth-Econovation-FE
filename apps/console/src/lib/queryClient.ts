import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { markUnauthenticated } from "@/lib/authStatus";
import { logout } from "@/lib/logout";

/**
 * 403 응답으로 로그아웃을 시작했는지 표시하는 1회용 가드.
 *
 * 동시에 떠 있던 여러 요청이 한꺼번에 403으로 실패하면 onError가 연쇄로 불려
 * `logout`(서버 로그아웃·토큰 삭제·SSO 리다이렉트)이 중복 실행될 수 있어 막습니다.
 */
let loggingOut = false;

/**
 * 인증/인가 실패 응답을 전역에서 처리합니다.
 * - 401(미인증/세션 만료): 인증 스토어에 기록 → `AuthGate`가 본문 대신 안내 화면을 띄웁니다.
 *   (자동 리다이렉트 대신 사용자가 안내를 본 뒤 버튼으로 직접 로그인)
 * - 403(콘솔 접근 권한 없음): 즉시 로그아웃합니다(서버 로그아웃·토큰 삭제 후 SSO 로그인 이동).
 *
 * 콘솔은 토큰 기반이라 별도 인증 가드(과거의 me 조회) 없이, 어떤 요청이든 인증/인가로
 * 실패하면 이 전역 핸들러가 받습니다. 그 외 4xx(400 검증 실패·404 없음·409 충돌 등)는
 * 기능별 에러 처리에 맡겨, 폼 검증·리소스 없음 안내가 인증 처리에 가로채이지 않도록 합니다.
 */
export const handleAuthFailure = (error: unknown): void => {
  if (!isAxiosError(error)) return;
  const status = error.response?.status;
  if (status === 401) markUnauthenticated();
  else if (status === 403 && !loggingOut) {
    loggingOut = true;
    void logout();
  }
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
