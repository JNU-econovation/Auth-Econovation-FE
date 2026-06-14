import { Outlet } from "react-router";
import { isAxiosError } from "axios";
import { ErrorState, Spinner } from "@auth-econovation/ui";
import useAuthMeQuery from "@/hooks/features/query/querys/useAuthMeQuery";
import SessionExpiredView from "@/components/auth/SessionExpiredView";
import ForbiddenView from "@/components/auth/ForbiddenView";

/**
 * 콘솔 전역 인증·인가 가드.
 *
 * 자식 라우트를 렌더링하기 전에 `GET /auth/me`로 세션과 권한을 확인합니다.
 * - 확인 중: 전체 화면 스피너
 * - 401(미인증/세션 만료): `SessionExpiredView`(다시 로그인 안내)
 * - 403(권한 부족) 또는 me 성공이지만 `USER` 역할: `ForbiddenView`(콘솔 접근 불가, v2 §141)
 * - 그 외 오류(네트워크/5xx): `ErrorState`(재시도) — 재로그인 유도가 아닌 재시도로 구분
 * - 인증·인가 통과: 중첩 라우트(`<Outlet />`) 렌더
 *
 * 라우트 레벨 가드이므로 `App`에서 보호 대상 라우트 전체를 이 엘리먼트로 감쌉니다.
 */
const RequireAuth = () => {
  const { isPending, isError, error, data: me, refetch } = useAuthMeQuery();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-soft">
        <Spinner className="h-6 w-6 border-[3px]" />
      </div>
    );
  }

  if (isError) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401) return <SessionExpiredView />;
    if (status === 403) return <ForbiddenView />;
    // 네트워크 단절·CORS·5xx 등 인증과 무관한 실패 — 재로그인이 아니라 재시도로 안내.
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-sunken">
        <ErrorState
          title="콘솔을 불러오지 못했습니다"
          desc="네트워크 상태를 확인한 뒤 다시 시도해 주세요."
          errorCode={status ? `HTTP_${status}` : "NETWORK_ERROR"}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  // 인증은 됐지만 콘솔 접근 권한이 없는 경우(USER) — 명세 §141.
  if (!me || me.role === "USER") {
    return <ForbiddenView />;
  }

  return <Outlet />;
};

export default RequireAuth;
