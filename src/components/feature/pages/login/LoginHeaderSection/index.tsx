import Spacing from "@shared/layout/Spacing";
import Text from "@shared/ui/Text";

const LoginHeaderSection = () => {
  return (
    <div>
      <Text size="1">Econovation</Text>
      <Spacing size={28} direction="vertical" />
      <Text size="4">하나의 아이디로 동아리 서비스들을 이용해보세요!</Text>
    </div>
  );
};

export default LoginHeaderSection;
