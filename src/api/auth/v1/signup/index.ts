import { apiClient } from "@/api/client";
import type { SignUpRequest } from "../../types";

/**
 * @public
 * @category Constants
 * @description 회원가입 API 경로
 */
export const SIGN_UP_API_PATH = "/api/v1/auth/signup";

/**
 * @public
 * @category Auth
 * @description 회원가입 API를 호출합니다. 명세상 성공(201) 시 토큰을 발급하지 않으므로
 * 반환값이 없으며, 가입 후 `signInApi`로 로그인을 별도 호출해야 합니다.
 * @param data - 회원가입 요청 데이터
 * @param code - SSO 인증 코드 (선택적). 존재하면 query string으로 포함되어 기존 계정 연결에 사용됩니다.
 * @returns void
 * @example
 * await signUpApi({ name: "홍길동", loginId: "hong123", password: "Econo1234!", generation: 30, status: "AM" });
 */
export const signUpApi = async (
  data: SignUpRequest,
  code?: string,
): Promise<void> => {
  await apiClient.post(SIGN_UP_API_PATH, data, {
    params: code ? { code } : undefined,
  });
};
