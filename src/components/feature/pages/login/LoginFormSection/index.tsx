import { Link } from "react-router";
import Spacing from "@shared/layout/Spacing";
import TextFieldLayout from "@shared/layout/TextFieldLayout";
import DefaultButton from "@shared/ui/DefaultButton";
import Text from "@shared/ui/Text";

function LoginFormSection() {
  return (
    <section>
      <TextFieldLayout label="id" placeholder="아이디를 입력해주세요." />
      <Spacing size={24} direction="vertical" />
      <TextFieldLayout
        label="password"
        placeholder="비밀번호를 입력해주세요."
        type="password"
        helperTextColor="info"
      />
      <Spacing size={24} direction="vertical" />
      <DefaultButton title="로그인 하기" fullWidth />
      <Spacing size={16} direction="vertical" />
      <Link to="/sign-in">
        <Text size="4">Sign up</Text>
      </Link>
    </section>
  );
}

export default LoginFormSection;
