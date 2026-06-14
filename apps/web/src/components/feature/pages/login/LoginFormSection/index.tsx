import React, { ChangeEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";
import axios, { AxiosError } from "axios";
import {
  Spacing,
  TextFieldLayout,
  DefaultButton,
  Text,
} from "@auth-econovation/ui";
import type { ApiErrorResponse, ClientType } from "@auth-econovation/api";
import useSignIn from "@/hooks/features/query/mutations/useSignIn";
import { getErrorMessageFromCode } from "./errorCodeMap";

const resolveClientType = (raw: string | null): ClientType =>
  raw === "APP" ? "APP" : "WEB";

function LoginFormSection() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [loginError, setLoginError] = useState("");

  const [searchParams] = useSearchParams();
  const clientType = resolveClientType(searchParams.get("client-type"));
  const clientId = searchParams.get("client-id") ?? "";

  const mutation = useSignIn();

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
    setIdError("");
    setLoginError("");
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setLoginError("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (id === "") {
      setIdError("아이디를 입력해주세요.");
      return;
    }
    if (password === "") {
      setLoginError("비밀번호를 입력해주세요.");
      return;
    }

    // 로그인 성공 후 리다이렉트는 더 이상 프론트가 수행하지 않습니다(백엔드/SSO 흐름이 담당).
    // 프론트는 자격 증명을 전송하고, 실패 시 에러만 표시합니다.
    mutation.mutate(
      { data: { loginId: id, password, clientId }, clientType },
      {
        onError: (error) => {
          if (!axios.isAxiosError(error)) {
            setLoginError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
            return;
          }

          const axiosError = error as AxiosError<ApiErrorResponse>;
          const responseData = axiosError.response?.data;
          if (!responseData) {
            setLoginError("서버 응답을 받지 못했습니다. 다시 시도해주세요.");
            return;
          }

          const message = getErrorMessageFromCode(responseData.errorCode);
          setLoginError(
            message ?? responseData.message ?? "로그인 중 오류가 발생했습니다.",
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
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
        helperText={loginError || undefined}
        helperTextColor="error"
      />
      <Spacing size={24} direction="vertical" />
      <DefaultButton
        type="submit"
        title={mutation.isPending ? "로그인 중..." : "로그인 하기"}
        fullWidth
        disabled={mutation.isPending}
      />
      <Spacing size={16} direction="vertical" />
      <Link to="/sign-in" className="flex justify-center">
        <Text size="7">회원가입하기</Text>
      </Link>
    </form>
  );
}

export default LoginFormSection;
