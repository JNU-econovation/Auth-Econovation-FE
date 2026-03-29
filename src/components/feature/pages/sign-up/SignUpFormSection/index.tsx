import Spacing from "@shared/layout/Spacing";
import TextFieldLayout from "@shared/layout/TextFieldLayout";
import SelectFieldLayout from "@shared/layout/SelectFieldLayout";
import DefaultButton from "@shared/ui/DefaultButton";
import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import axios, { AxiosError } from "axios";
import type { ActiveStatus, ApiErrorResponse } from "@/api/auth/types";
import { useSignUp } from "@/hooks/useSignUp";
import { getFieldErrorFromCode } from "./errorCodeMap";
import { validateGeneration } from "./validateGeneration";
import { validateId } from "./validateId";
import { validateName } from "./validateName";
import { validatePassword } from "./validatePassword";
import { validatePasswordConfirm } from "./validatePasswordConfirm";

const ACTIVE_STATUS_OPTIONS = [
  { value: "am", label: "AM" },
  { value: "cm", label: "CM" },
  { value: "rm", label: "RM" },
  { value: "ob", label: "OB" },
] as const;

const VALID_ACTIVE_STATUSES = new Set<string>(["am", "cm", "rm", "ob"]);

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
  const [activeStatus, setActiveStatus] = useState<ActiveStatus | "">("");
  const [activeStatusError, setActiveStatusError] = useState("");

  const navigate = useNavigate();
  const mutation = useSignUp();

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

  const handleActiveStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!VALID_ACTIVE_STATUSES.has(value)) {
      setActiveStatusError("유효하지 않은 활동 상태입니다.");
      return;
    }
    setActiveStatus(value as ActiveStatus);
    setActiveStatusError("");
  };

  const validateAllFields = (): boolean => {
    const errors = {
      name: name === "" ? "이름을 입력해주세요." : validateName(name),
      id: id === "" ? "아이디를 입력해주세요." : validateId(id),
      password:
        password === ""
          ? "비밀번호를 입력해주세요."
          : validatePassword(password),
      passwordConfirm:
        passwordConfirm === ""
          ? "비밀번호 확인을 입력해주세요."
          : validatePasswordConfirm(passwordConfirm, password),
      generation:
        generation === ""
          ? "기수를 입력해주세요."
          : validateGeneration(generation),
      activeStatus: activeStatus === "" ? "활동 상태를 선택해주세요." : "",
    };

    setNameError(errors.name);
    setIdError(errors.id);
    setPasswordError(errors.password);
    setPasswordConfirmError(errors.passwordConfirm);
    setGenerationError(errors.generation);
    setActiveStatusError(errors.activeStatus);

    return Object.values(errors).every((error) => error === "");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAllFields()) {
      return;
    }

    mutation.mutate(
      {
        name,
        id,
        password,
        generation: Number(generation),
        activeStatus: activeStatus as ActiveStatus,
      },
      {
        onSuccess: (data) => {
          localStorage.setItem("accessToken", data.accessToken);
          navigate("/");
        },
        onError: (error) => {
          if (!axios.isAxiosError(error)) {
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            return;
          }

          const axiosError = error as AxiosError<ApiErrorResponse>;
          const responseData = axiosError.response?.data;
          if (!responseData) {
            alert("서버 응답을 받지 못했습니다. 다시 시도해주세요.");
            return;
          }

          const fieldError = getFieldErrorFromCode(
            responseData.code,
            responseData.message,
          );
          if (!fieldError) {
            alert(responseData.message || "회원가입 중 오류가 발생했습니다.");
            return;
          }

          const errorSetterMap: Record<string, (msg: string) => void> = {
            name: setNameError,
            id: setIdError,
            password: setPasswordError,
            generation: setGenerationError,
            activeStatus: setActiveStatusError,
          };

          const setter = errorSetterMap[fieldError.field];
          if (setter) {
            setter(fieldError.message);
          }
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <SelectFieldLayout
        label="활동 상태"
        value={activeStatus}
        onChange={handleActiveStatusChange}
        helperText={activeStatusError || undefined}
        helperTextColor="error"
      >
        <option value="" disabled>
          활동 상태를 선택해주세요.
        </option>
        {ACTIVE_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectFieldLayout>
      <Spacing size={24} direction="vertical" />
      <DefaultButton
        type="submit"
        title={mutation.isPending ? "회원가입 중..." : "회원가입 하기"}
        fullWidth
        disabled={mutation.isPending}
      />
    </form>
  );
}

export default SignUpFormSection;
