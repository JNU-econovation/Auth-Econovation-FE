import { Button, Card, CardBody, LockIcon } from "@auth-econovation/ui";
import { redirectToLogin } from "@/lib/redirectToLogin";

/**
 * 권한 부족 안내 화면.
 *
 * 로그인은 되어 있으나 콘솔 접근 권한이 없는 경우(admin API 403)에 콘솔 본문 대신
 * 표시합니다(v2 명세 §141 "USER: 콘솔 접근 불가 → 안내 페이지"). API 요청이 403으로
 * 실패하면 (`queryClient` 전역 핸들러 → `authStatus`) `AuthGate`가 이 화면을 띄웁니다.
 * 다른(관리자) 계정으로 다시 로그인할 수 있도록 SSO 로그인 진입점을 제공합니다.
 */
const ForbiddenView = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg-sunken px-4">
    <Card className="w-full max-w-[400px]">
      <CardBody className="flex flex-col items-center px-8 py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-ink-soft">
          <LockIcon className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold tracking-[-0.01em]">
          접근 권한이 없습니다
        </h1>
        <p className="mt-2 text-sm leading-5 text-ink-soft">
          이 콘솔은 관리자 전용입니다.
          <br />
          관리자 계정으로 다시 로그인해 주세요.
        </p>
        <Button
          variant="secondary"
          className="mt-6 w-full"
          onClick={redirectToLogin}
        >
          다른 계정으로 로그인
        </Button>
      </CardBody>
    </Card>
  </div>
);

export default ForbiddenView;
