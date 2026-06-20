import { apiClient } from "../../../client";
import type { ClientType, SignInRequest, SignInResponse } from "../../types";

/**
 * @public
 * @category Constants
 * @description 로그인 API 경로
 */
export const SIGN_IN_API_PATH = "/api/v1/auth/login";

/**
 * @public
 * @category Auth
 * @description 로그인 API를 호출합니다. `Client-Type` 헤더로 WEB/APP 동작을 구분합니다.
 * - `WEB`: AT/RT를 HttpOnly 쿠키로 발급. 응답 바디엔 `accessExpiredTime`/`redirectUrl`.
 * - `APP`: AT/RT를 응답 바디(`accessToken`/`refreshToken`)로 반환(+`redirectUrl`).
 * @param data - 로그인 요청 데이터 (loginId, password, clientId)
 * @param clientType - 클라이언트 타입 ("WEB" | "APP")
 * @returns 로그인 응답 (accessExpiredTime, APP일 경우 accessToken/refreshToken 포함)
 * @example
 * const result = await signInApi(
 *   { loginId: "hong123", password: "Econo1234!", clientId: "a1b2c3d4-..." },
 *   "WEB",
 * );
 * console.log(result.accessExpiredTime);
 */
export const signInApi = async (
  data: SignInRequest,
  clientType: ClientType,
): Promise<SignInResponse> => {
  const response = await apiClient.post<SignInResponse>(
    SIGN_IN_API_PATH,
    data,
    {
      headers: { "Client-Type": clientType },
    },
  );
  return response.data;
};
