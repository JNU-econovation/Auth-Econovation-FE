import React, { ChangeEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";
import axios, { AxiosError } from "axios";
import Spacing from "@shared/layout/Spacing";
import TextFieldLayout from "@shared/layout/TextFieldLayout";
import DefaultButton from "@shared/ui/DefaultButton";
import Text from "@shared/ui/Text";
import type { ApiErrorResponse, ClientType } from "@/api/auth/types";
import useSignIn from "@/hooks/features/query/mutations/useSignIn";
import { getErrorMessageFromCode } from "./errorCodeMap";

const isValidRedirectUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const resolveClientType = (raw: string | null): ClientType =>
  raw === "mobile" ? "mobile" : "web";

function LoginFormSection() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [loginError, setLoginError] = useState("");

  const [searchParams] = useSearchParams();
  const clientType = resolveClientType(searchParams.get("client-type"));
  const redirectUrl = searchParams.get("redirect-url") ?? "";

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

    mutation.mutate(
      { data: { id, password }, clientType },
      {
        onSuccess: (response) => {
          const { accessToken, accessExpiredTime, refreshToken } =
            response.data;

          if (!redirectUrl || !isValidRedirectUrl(redirectUrl)) {
            setLoginError(
              "유효하지 않은 리다이렉트 URL입니다. 서비스 관리자에게 문의해주세요.",
            );
            return;
          }

          const params = new URLSearchParams({
            accessToken,
            accessExpiredTime: String(accessExpiredTime),
          });

          if (clientType === "mobile" && refreshToken) {
            params.set("refreshToken", refreshToken);
          }

          window.location.href = `${redirectUrl}?${params.toString()}`;
        },
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

          const message = getErrorMessageFromCode(responseData.code);
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
