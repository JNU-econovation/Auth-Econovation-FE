import { useSyncExternalStore } from "react";
import { Outlet } from "react-router";
import { getAuthStatus, subscribeAuthStatus } from "@/lib/authStatus";
import SessionExpiredView from "@/components/auth/SessionExpiredView";
import ForbiddenView from "@/components/auth/ForbiddenView";

/**
 * 콘솔 인증 상태 게이트.
 *
 * 콘솔은 토큰 기반이라 진입을 막지 않고 본문을 렌더하다가, API 요청이 401/403으로 실패하면
 * 전역 핸들러(`queryClient` onError)가 인증 스토어(`authStatus`)의 상태를 바꿉니다. 이
 * 컴포넌트가 그 상태를 구독해, 본문 대신 안내 화면을 전체 영역에 띄웁니다(자동 리다이렉트
 * 대신 사용자가 화면의 버튼으로 직접 로그인).
 * - `unauthenticated`(401): `SessionExpiredView` — 미인증/세션 만료
 * - `forbidden`(403): `ForbiddenView` — 권한 부족
 * - `ok`: 중첩 라우트(`<Outlet />`) 렌더
 *
 * 라우트 레벨 게이트이므로 `App`에서 보호 대상 라우트 전체를 이 엘리먼트로 감쌉니다.
 */
const AuthGate = () => {
  const status = useSyncExternalStore(
    subscribeAuthStatus,
    getAuthStatus,
    getAuthStatus,
  );

  if (status === "unauthenticated") return <SessionExpiredView />;
  if (status === "forbidden") return <ForbiddenView />;
  return <Outlet />;
};

export default AuthGate;
