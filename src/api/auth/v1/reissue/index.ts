import { apiClient } from "@/api/client";
import type {
  ClientType,
  ReissueRequest,
  ReissueResponse,
} from "../../types";

/**
 * @public
 * @category Constants
 * @description AT/RT 재발급 API 경로
 */
export const REISSUE_API_PATH = "/api/v1/auth/reissue";

/**
 * @public
 * @category Auth
 * @description AT가 만료되면 RT로 새 AT/RT를 재발급합니다.
 * - `WEB`: RT를 HttpOnly 쿠키(`rt`)에서 자동으로 읽으므로 바디 불필요.
 * - `APP`: RT를 `data.refreshToken`에 담아 전송.
 *
 * 추천 패턴: 401 수신 → 재발급 → 성공하면 원래 요청 재시도. 재발급도 401이면 로그인 페이지로.
 * @param clientType - 클라이언트 타입 ("WEB" | "APP")
 * @param data - APP 전용 재발급 요청 데이터 (refreshToken)
 * @returns 재발급 응답 (accessExpiredTime, APP일 경우 accessToken/refreshToken 포함)
 * @example
 * const result = await reissueApi("WEB");
 * console.log(result.accessExpiredTime);
 */
export const reissueApi = async (
  clientType: ClientType,
  data?: ReissueRequest,
): Promise<ReissueResponse> => {
  const response = await apiClient.post<ReissueResponse>(
    REISSUE_API_PATH,
    clientType === "APP" ? data : undefined,
    {
      headers: { "Client-Type": clientType },
    },
  );
  return response.data;
};
