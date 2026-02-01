import SignUpFormSection from "@pages/sign-up/SignUpFormSection";
import SignUpHeaderSection from "@pages/sign-up/SignUpHeaderSection";
import ScreenWrapper from "@shared/layout/ScreenWrapper";
import Spacing from "@shared/layout/Spacing";

function SignUpPage() {
  return (
    <ScreenWrapper>
      <Spacing size={48} direction="vertical" />
      <SignUpHeaderSection />
      <Spacing size={50} direction="vertical" />
      <SignUpFormSection />
    </ScreenWrapper>
  );
}

export default SignUpPage;
