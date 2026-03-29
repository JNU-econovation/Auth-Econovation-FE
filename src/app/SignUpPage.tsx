import SignUpFormSection from "@pages/sign-up/SignUpFormSection";
import SignUpHeaderSection from "@pages/sign-up/SignUpHeaderSection";
import ScreenWrapper from "@shared/layout/ScreenWrapper";
import Spacing from "@shared/layout/Spacing";
import { Link } from "react-router";

function SignUpPage() {
  return (
    <ScreenWrapper>
      <Spacing size={48} direction="vertical" />
      <SignUpHeaderSection />
      <Spacing size={50} direction="vertical" />
      <SignUpFormSection />
      <Spacing size={16} direction="vertical" />
      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link to="/" className="text-blue-600 font-medium hover:underline">
          로그인
        </Link>
      </p>
      <Spacing size={50} direction="vertical" />
    </ScreenWrapper>
  );
}

export default SignUpPage;
