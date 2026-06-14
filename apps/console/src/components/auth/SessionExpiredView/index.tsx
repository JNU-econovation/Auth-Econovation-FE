import { Button, Card, CardBody, LockIcon } from "@auth-econovation/ui";
import { redirectToLogin } from "@/lib/redirectToLogin";

/**
 * 미인증/세션 만료 안내 화면.
 *
 * 콘솔 접근에는 로그인이 필수이므로(쿠키 세션), 인증 확인(`GET /auth/me`)이 실패하면
 * 콘솔 본문 대신 이 화면을 전체 영역에 표시합니다. "로그인" 버튼은 자체 폼 없이
 * `env.ssoLoginUrl` 기반 SSO 로그인 페이지로 리다이렉트합니다.
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
