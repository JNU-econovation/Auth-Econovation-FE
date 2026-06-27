import { Button, Card, CardBody, LockIcon } from "@auth-econovation/ui";
import { redirectToLogin } from "@/lib/redirectToLogin";

/**
 * 미인증/세션 만료 안내 화면.
 *
 * 콘솔은 토큰 기반이라 진입을 막지 않고 본문을 렌더하다가, API 요청이 401로 실패하면
 * (`queryClient` 전역 핸들러 → `authStatus`) `AuthGate`가 본문 대신 이 화면을 전체 영역에
 * 표시합니다. "로그인" 버튼은 자체 폼 없이 `env.ssoLoginUrl` 기반 SSO 로그인 페이지로
 * 리다이렉트합니다(자동 이동이 아니라 사용자가 직접 진행).
 */
const SessionExpiredView = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg-sunken px-4">
    <Card className="w-full max-w-[400px]">
      <CardBody className="flex flex-col items-center px-8 py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-ink-soft">
          <LockIcon className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold tracking-[-0.01em]">
          로그인이 필요합니다
        </h1>
        <p className="mt-2 text-sm leading-5 text-ink-soft">
          세션이 만료되었거나 로그인되어 있지 않습니다.
          <br />
          콘솔을 사용하려면 다시 로그인해 주세요.
        </p>
        <Button className="mt-6 w-full" onClick={redirectToLogin}>
          로그인
        </Button>
      </CardBody>
    </Card>
  </div>
);

export default SessionExpiredView;
