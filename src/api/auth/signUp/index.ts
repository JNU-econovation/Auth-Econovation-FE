import { apiClient } from "@/api/client";
import type { SignUpRequest, SignUpResponse } from "../types";

/**
 * @public
 * @category Constants
 * @description 회원가입 API 경로
 */
export const SIGN_UP_API_PATH = "/api/auth/signup";

/**
 * @public
 * @category Auth
 * @description 회원가입 API를 호출합니다
 * @param data - 회원가입 요청 데이터
 * @param code - SSO 인증 코드 (선택적). 존재하면 query string으로 포함됩니다.
 * @returns 회원가입 응답 (accessToken 포함)
 * @example
 * const result = await signUpApi({ name: "홍길동", id: "hong123", password: "********", generation: 10, activeStatus: "am" }, "abc123");
 * console.log(result.accessToken);
 */
export const signUpApi = async (
  data: SignUpRequest,
  code?: string,
): Promise<SignUpResponse> => {
  const response = await apiClient.post<SignUpResponse>(
    SIGN_UP_API_PATH,
    data,
    {
      params: code && { code },
    },
  );
  return response.data;
};
