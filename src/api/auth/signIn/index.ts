import { apiClient } from "@/api/client";
import type { ClientType, SignInRequest, SignInResponse } from "../types";

/**
 * @public
 * @category Constants
 * @description 로그인 API 경로
 */
export const SIGN_IN_API_PATH = "/api/auth/signin";

/**
 * @public
 * @category Auth
 * @description 로그인 API를 호출합니다
 * @param data - 로그인 요청 데이터 (id, password)
 * @param clientType - 클라이언트 타입 ("web" | "mobile")
 * @returns 로그인 응답 (accessToken, accessExpiredTime, refreshToken 포함)
 * @example
 * const result = await signInApi({ id: "hong123", password: "********" }, "web");
 * console.log(result.data.accessToken);
 */
export const signInApi = async (
  data: SignInRequest,
  clientType: ClientType,
): Promise<SignInResponse> => {
  const response = await apiClient.post<SignInResponse>(SIGN_IN_API_PATH, data, {
    headers: { "Client-Type": clientType },
    withCredentials: true,
  });
  return response.data;
};
