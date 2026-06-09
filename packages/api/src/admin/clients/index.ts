import { apiClient } from "../../client";
import type { AdminClient } from "../types";

/**
 * @public
 * @category Constants
 * @description OAuth 클라이언트 등록 API 경로 (`POST /api/v1/admin/clients`)
 */
export const ADMIN_CLIENTS_API_PATH = "/api/v1/admin/clients";

/**
 * @public
 * @category Constants
 * @description 클라이언트 단건 조회 API 경로 (`GET /api/v1/admin/clients/{clientId}`)
 * @param clientId - 클라이언트 ID
 * @returns API 경로 문자열
 */
export const ADMIN_CLIENT_API_PATH = (clientId: string) =>
  `/api/v1/admin/clients/${clientId}`;

/**
 * @public
 * @category Constants
 * @description 클라이언트 redirect URI 관리 API 경로 (POST/DELETE/PUT 공통)
 * @param clientId - 클라이언트 ID
 * @returns API 경로 문자열
 */
export const ADMIN_CLIENT_REDIRECT_URIS_API_PATH = (clientId: string) =>
  `/api/v1/admin/clients/${clientId}/redirect-uris`;

/**
 * @public
 * @category Types
 * @interface PostAdminClientApiRequest
 * @description 클라이언트 등록 요청 바디
 * @property {string} clientName - 클라이언트 이름(중복 불가)
 * @property {string[]} redirectUris - 1개 이상의 redirect URI
 */
export interface PostAdminClientApiRequest {
  clientName: string;
  redirectUris: string[];
}

/**
 * @public
 * @category Types
 * @interface PostAdminClientApiResponse
 * @description 클라이언트 등록 응답(발급된 clientId)
 * @property {string} clientId - 발급된 클라이언트 ID
 */
export interface PostAdminClientApiResponse {
  clientId: string;
}

/**
 * @public
 * @category AdminClients
 * @description OAuth 클라이언트를 등록합니다. `ADMIN` 이상 권한 필요. redirectUris는 1개 이상 필수.
 * @param data - 클라이언트 이름과 redirect URI 목록
 * @returns 발급된 clientId
 * @example
 * const { clientId } = await postAdminClientApi({ clientName: "ECONO SPA", redirectUris: ["https://app/cb"] });
 */
export const postAdminClientApi = async (
  data: PostAdminClientApiRequest,
): Promise<PostAdminClientApiResponse> => {
  const response = await apiClient.post<PostAdminClientApiResponse>(
    ADMIN_CLIENTS_API_PATH,
    data,
  );
  return response.data;
};

/**
 * @public
 * @category Types
 * @description 클라이언트 단건 조회 응답 타입
 */
export type GetAdminClientApiResponse = AdminClient;

/**
 * @public
 * @category AdminClients
 * @description 클라이언트 정보와 redirect URI 목록을 조회합니다. `ADMIN` 이상 권한 필요.
 * @param clientId - 조회할 클라이언트 ID
 * @returns 클라이언트 상세(clientId, clientName, redirectUris)
 * @example
 * const client = await getAdminClientApi("a1b2c3d4-...");
 * console.log(client.redirectUris);
 */
export const getAdminClientApi = async (
  clientId: string,
): Promise<GetAdminClientApiResponse> => {
  const response = await apiClient.get<GetAdminClientApiResponse>(
    ADMIN_CLIENT_API_PATH(clientId),
  );
  return response.data;
};

/**
 * @public
 * @category Types
 * @interface RedirectUrisApiResponse
 * @description redirect URI 변경(추가/삭제/교체) 공통 응답
 * @property {string} clientId - 클라이언트 ID
 * @property {string[]} redirectUris - 갱신된 redirect URI 목록
 */
export interface RedirectUrisApiResponse {
  clientId: string;
  redirectUris: string[];
}

/**
 * @public
 * @category AdminClients
 * @description 클라이언트에 redirect URI를 1건 추가합니다(기존 유지). `ADMIN` 이상 권한 필요.
 * @param clientId - 클라이언트 ID
 * @param uri - 추가할 redirect URI
 * @returns 갱신된 redirect URI 목록
 * @example
 * const { redirectUris } = await postAdminClientRedirectUriApi("a1b2...", "https://new/cb");
 */
export const postAdminClientRedirectUriApi = async (
  clientId: string,
  uri: string,
): Promise<RedirectUrisApiResponse> => {
  const response = await apiClient.post<RedirectUrisApiResponse>(
    ADMIN_CLIENT_REDIRECT_URIS_API_PATH(clientId),
    { uri },
  );
  return response.data;
};

/**
 * @public
 * @category AdminClients
 * @description 클라이언트의 redirect URI를 1건 삭제합니다. `ADMIN` 이상 권한 필요.
 * @param clientId - 클라이언트 ID
 * @param uri - 삭제할 redirect URI
 * @returns 갱신된 redirect URI 목록
 * @example
 * const { redirectUris } = await deleteAdminClientRedirectUriApi("a1b2...", "https://old/cb");
 */
export const deleteAdminClientRedirectUriApi = async (
  clientId: string,
  uri: string,
): Promise<RedirectUrisApiResponse> => {
  const response = await apiClient.delete<RedirectUrisApiResponse>(
    ADMIN_CLIENT_REDIRECT_URIS_API_PATH(clientId),
    { data: { uri } },
  );
  return response.data;
};

/**
 * @public
 * @category AdminClients
 * @description 클라이언트의 redirect URI 목록을 전체 교체합니다. `ADMIN` 이상 권한 필요.
 * @param clientId - 클라이언트 ID
 * @param uris - 교체할 redirect URI 전체 목록
 * @returns 갱신된 redirect URI 목록
 * @example
 * const { redirectUris } = await putAdminClientRedirectUrisApi("a1b2...", ["https://only/cb"]);
 */
export const putAdminClientRedirectUrisApi = async (
  clientId: string,
  uris: string[],
): Promise<RedirectUrisApiResponse> => {
  const response = await apiClient.put<RedirectUrisApiResponse>(
    ADMIN_CLIENT_REDIRECT_URIS_API_PATH(clientId),
    { uris },
  );
  return response.data;
};
