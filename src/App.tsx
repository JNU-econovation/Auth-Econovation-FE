import ScreenWrapper from "@shared/layout/ScreenWrapper";
import Spacing from "@shared/layout/Spacing";
import TextFieldLayout from "@shared/layout/TextFieldLayout";
import DefaultButton from "@shared/ui/DefaultButton";
import Text from "@shared/ui/Text";

function App() {
  return (
    <ScreenWrapper>
      <Spacing size={48} direction="vertical" />
      <Text size="1">Econovation</Text>
      <Spacing size={28} direction="vertical" />
      <Text size="4">하나의 아이디로 동아리 서비스들을 이용해보세요!</Text>
      <Spacing size={50} direction="vertical" />
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
    </ScreenWrapper>
  );
}

export default App;
