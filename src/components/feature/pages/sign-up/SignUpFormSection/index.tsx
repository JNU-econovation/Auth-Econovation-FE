import Spacing from "@shared/layout/Spacing";
import TextFieldLayout from "@shared/layout/TextFieldLayout";
import DefaultButton from "@shared/ui/DefaultButton";
import { ChangeEvent, useState } from "react";

function SignUpFormSection() {
  const [generation, setGeneration] = useState("");

  const handleGenerationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 빈 문자열 허용
    if (value === "") {
      setGeneration("");
      return;
    }

    // 숫자만 허용
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      return;
    }

    // 0~99 범위만 허용
    if (numericValue >= 0 && numericValue <= 99) {
      setGeneration(value);
    }
  };

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
      <TextFieldLayout
        label="password confirm"
        placeholder="비밀번호를 다시 입력해주세요."
        type="password"
        helperTextColor="info"
      />
      <Spacing size={24} direction="vertical" />
      <TextFieldLayout
        label="기수"
        placeholder="기수를 입력해주세요 (0-99)"
        type="text"
        value={generation}
        onChange={handleGenerationChange}
      />
      <Spacing size={24} direction="vertical" />
      <DefaultButton title="회원가입 하기" fullWidth />
    </section>
  );
}

export default SignUpFormSection;
