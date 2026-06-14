import LoginFormSection from "@pages/login/LoginFormSection";
import LoginHeaderSection from "@pages/login/LoginHeaderSection";
import { ScreenWrapper, Spacing } from "@auth-econovation/ui";
import { useDevLoginParams } from "@/hooks/useDevLoginParams";

function LoginPage() {
  const { redirecting } = useDevLoginParams();

  // 개발 모드에서 누락된 로그인 쿼리를 보정(replace)하는 동안에는 폼을 잠시 렌더하지 않습니다.
  // 운영 빌드에서는 항상 false이므로 영향이 없습니다.
  if (redirecting) return null;

  return (
    <ScreenWrapper>
      <Spacing size={48} direction="vertical" />
      <LoginHeaderSection />
      <Spacing size={50} direction="vertical" />
      <LoginFormSection />
    </ScreenWrapper>
  );
}

export default LoginPage;
