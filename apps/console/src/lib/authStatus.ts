/**
 * 콘솔 인증 상태 외부 스토어.
 *
 * 콘솔은 토큰 기반이라 진입 가드(과거의 me 조회) 없이 일단 화면을 렌더하고, API 요청이
 * 401로 실패하면 미인증 상태로 본다. 그 감지는 React 트리 밖의 전역 핸들러
 * (`queryClient` onError)에서 일어나므로, 모듈 레벨 스토어에 상태를 담아
 * `useSyncExternalStore`로 컴포넌트(`AuthGate`)가 구독한다.
 *
 * 이 스토어를 두는 이유: 401일 때 SSO 로그인으로 **자동 전체 페이지 리다이렉트**하는
 * 대신, 본문 위에 "로그인 필요" 안내 화면을 띄우기 위함이다(로그인은 사용자가 화면의
 * 버튼으로 직접 진행 → `redirectToLogin`). 403(권한 없음)은 안내 화면 없이 곧바로
 * 로그아웃하므로 이 스토어를 거치지 않는다(`queryClient`에서 `logout` 호출).
 */

/** `ok`: 정상/미확정, `unauthenticated`: 401. */
export type AuthStatus = "ok" | "unauthenticated";

let status: AuthStatus = "ok";
const listeners = new Set<() => void>();

const setStatus = (next: AuthStatus): void => {
  if (status === next) return; // 동일 상태면 구독자에게 알리지 않아 불필요한 리렌더 방지
  status = next;
  for (const listener of listeners) listener();
};

/** 401 응답 감지 — 미인증/세션 만료 안내가 필요한 상태로 표시. */
export const markUnauthenticated = (): void => setStatus("unauthenticated");

/** 인증 상태 외부 스토어 구독 등록(`useSyncExternalStore` subscribe). 해제 함수를 반환. */
export const subscribeAuthStatus = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** 현재 인증 상태 스냅샷(`useSyncExternalStore` getSnapshot). */
export const getAuthStatus = (): AuthStatus => status;
