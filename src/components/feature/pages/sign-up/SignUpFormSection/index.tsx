import Spacing from "@shared/layout/Spacing";
import TextFieldLayout from "@shared/layout/TextFieldLayout";
import DefaultButton from "@shared/ui/DefaultButton";
import { ChangeEvent, useState } from "react";
import { validateGeneration } from "./validateGeneration";
import { validateId } from "./validateId";
import { validateName } from "./validateName";
import { validatePassword } from "./validatePassword";
import { validatePasswordConfirm } from "./validatePasswordConfirm";

function SignUpFormSection() {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [id, setId] = useState("");
  const [idError, setIdError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [generation, setGeneration] = useState("");
  const [generationError, setGenerationError] = useState("");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setNameError(validateName(value));
  };

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setId(value);
    setIdError(validateId(value));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
    // 비밀번호 변경 시 비밀번호 확인 재검증 (stale closure 방지: 새 value 직접 전달)
    if (passwordConfirm !== "") {
      setPasswordConfirmError(validatePasswordConfirm(passwordConfirm, value));
    }
  };

  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordConfirm(value);
    setPasswordConfirmError(validatePasswordConfirm(value, password));
  };

  const handleGenerationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGeneration(value);
    setGenerationError(validateGeneration(value));
  };

  return (
    <section>
      <TextFieldLayout
        label="이름"
        placeholder="이름을 입력해주세요."
        type="text"
        value={name}
        onChange={handleNameChange}
        helperText={nameError || undefined}
        helperTextColor="error"
      />
      <Spacing size={24} direction="vertical" />
      <TextFieldLayout
        label="id"
        placeholder="아이디를 입력해주세요."
        type="text"
        value={id}
        onChange={handleIdChange}
        helperText={idError || undefined}
        helperTextColor="error"
      />
      <Spacing size={24} direction="vertical" />
      <TextFieldLayout
        label="password"
        placeholder="비밀번호를 입력해주세요."
        type="password"
        value={password}
        onChange={handlePasswordChange}
        helperText={passwordError || undefined}
        helperTextColor="error"
      />
      <Spacing size={24} direction="vertical" />
      <TextFieldLayout
        label="password confirm"
        placeholder="비밀번호를 다시 입력해주세요."
        type="password"
        value={passwordConfirm}
        onChange={handlePasswordConfirmChange}
        helperText={passwordConfirmError || undefined}
        helperTextColor="error"
      />
      <Spacing size={24} direction="vertical" />
      <TextFieldLayout
        label="기수"
        placeholder="기수를 입력해주세요 (1-99)"
        type="text"
        value={generation}
        onChange={handleGenerationChange}
        helperText={generationError || undefined}
        helperTextColor="error"
      />
      <Spacing size={24} direction="vertical" />
      <DefaultButton title="회원가입 하기" fullWidth />
    </section>
  );
}

export default SignUpFormSection;
