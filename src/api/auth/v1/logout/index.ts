import { apiClient } from "@/api/client";
import type { ClientType } from "../../types";

/**
 * @public
 * @category Constants
 * @description 로그아웃 API 경로
 */
export const LOGOUT_API_PATH = "/api/v1/auth/logout";

/**
 * @public
 * @category Auth
 * @description 로그아웃 API를 호출합니다. **멱등** — 이미 로그아웃 상태여도 200을 반환합니다.
 * - `WEB`: 서버가 `at`/`rt` 쿠키를 즉시 만료(`Max-Age=0`).
 * - `APP`: 서버 처리 없음. 호출 측이 보관 중인 AT/RT를 직접 삭제해야 합니다.
 * @param clientType - 클라이언트 타입 ("WEB" | "APP")
 * @returns void
 * @example
 * await logoutApi("WEB");
 */
export const logoutApi = async (clientType: ClientType): Promise<void> => {
  await apiClient.post(LOGOUT_API_PATH, undefined, {
    headers: { "Client-Type": clientType },
  });
};
