import LoginFormSection from "@pages/login/LoginFormSection";
import LoginHeaderSection from "@pages/login/LoginHeaderSection";
import ScreenWrapper from "@shared/layout/ScreenWrapper";
import Spacing from "@shared/layout/Spacing";

function LoginPage() {
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
