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
import { redirectToClient } from "@/lib/redirectToClient";
import { getErrorMessageFromCode } from "./errorCodeMap";

/**
 * SSO 진입 시 전달되는 `client-type` 쿼리 값(소문자 `web`|`app`, 미지정 시 `web`)을
 * 백엔드가 요구하는 `Client-Type` 헤더 값(대문자 `WEB`|`APP`)으로 변환합니다.
 * 쿼리 값 표기가 흔들려도 안전하도록 소문자로 정규화한 뒤 판별합니다.
 */
const resolveClientType = (raw: string | null): ClientType =>
  raw?.toLowerCase() === "app" ? "APP" : "WEB";

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

    // 로그인 성공 시 서버가 내려준 redirectUrl(요청 클라이언트의 콜백 주소)로 전체 페이지를 이동합니다.
    // APP은 바디로 받은 토큰을 함께 넘겨 redirectUrl에 쿼리로 첨부하고(WEB은 토큰이 없어 그대로 이동),
    // 실패 시에는 에러 메시지만 표시합니다.
    mutation.mutate(
      { data: { loginId: id, password, clientId }, clientType },
      {
        onSuccess: (data) => {
          if (data.redirectUrl) {
            redirectToClient(data.redirectUrl, {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              accessExpiredTime: data.accessExpiredTime,
            });
          }
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
