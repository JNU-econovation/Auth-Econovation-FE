import { apiClient } from "../client";

/**
 * @auth-econovation/api/clients — SSO 클라이언트 셀프 등록 API.
 *
 * 인증된 회원이 **본인 소유** OAuth 클라이언트를 직접 관리합니다(`/api/v1/clients`).
 * 관리자가 대신 등록하는 어드민 클라이언트(`@auth-econovation/api/admin`)와 달리,
 * 회원당 최대 5개 제한이 있고 등록 시 `clientSecret`을 1회 반환하며,
 * `pathPrefix`+`upstreamUrl`을 함께 제공하면 Gateway 동적 라우트가 같은 트랜잭션에서 처리됩니다.
 */

/**
 * @public
 * @category Constants
 * @description 셀프 클라이언트 목록/등록 API 경로 (`GET·POST /api/v1/clients`)
 */
export const CLIENTS_API_PATH = "/api/v1/clients";

/**
 * @public
 * @category Constants
 * @description 셀프 클라이언트 단건 API 경로를 생성하는 함수 (`GET·PUT·DELETE /api/v1/clients/{clientId}`)
 * @param clientId - 클라이언트 ID
 * @returns API 경로 문자열
 */
export const CLIENT_API_PATH = (clientId: string) =>
  `/api/v1/clients/${clientId}`;

/**
 * @public
 * @category Types
 * @interface ClientRoute
 * @description 셀프 클라이언트에 연결된 Gateway 라우트 요약(타임스탬프 제외).
 * @property {string} routeId - 라우트 ID
 * @property {string} pathPrefix - 경로 프리픽스
 * @property {string} upstreamUrl - 업스트림(대상) URL
 * @property {boolean} enabled - 활성화 여부
 */
export interface ClientRoute {
  routeId: string;
  pathPrefix: string;
  upstreamUrl: string;
  enabled: boolean;
}

/**
 * @public
 * @category Types
 * @interface SelfClient
 * @description 본인 소유 OAuth 클라이언트(연결 라우트 포함, `clientSecret` 미포함).
 * @property {string} clientId - 클라이언트 ID
 * @property {string} clientName - 클라이언트 이름
 * @property {string[]} redirectUris - 리다이렉트 URI 목록
 * @property {ClientRoute | null} route - 연결된 Gateway 라우트(없으면 null)
 */
export interface SelfClient {
  clientId: string;
  clientName: string;
  redirectUris: string[];
  route: ClientRoute | null;
}

/**
 * @public
 * @category Types
 * @interface ClientApiRequest
 * @description 셀프 클라이언트 등록/수정 요청 바디(`POST`·`PUT` 공통).
 * `pathPrefix`·`upstreamUrl`은 선택이며, 둘 다 제공 시에만 라우트를 함께 처리합니다(하나만 제공 시 400).
 * @property {string} clientName - 클라이언트 이름(빈 문자열 불가)
 * @property {string[]} redirectUris - 리다이렉트 URI 목록(필수)
 * @property {string} [pathPrefix] - Gateway 라우트 경로 프리픽스(`/api/{namespace}` 형태)
 * @property {string} [upstreamUrl] - 라우트 업스트림(대상) URL
 */
export interface ClientApiRequest {
  clientName: string;
  redirectUris: string[];
  pathPrefix?: string;
  upstreamUrl?: string;
}

/**
 * @public
 * @category Types
 * @interface PostClientApiResponse
 * @description 셀프 클라이언트 등록 응답. `clientSecret`은 이 응답에서만 1회 노출됩니다.
 * 라우트를 함께 생성한 경우 라우트 필드가 포함됩니다.
 * @property {string} clientId - 발급된 클라이언트 ID
 * @property {string} clientSecret - 발급된 클라이언트 시크릿(1회 노출)
 * @property {string} [routeId] - 생성된 라우트 ID(라우트 생성 시에만)
 * @property {string} [pathPrefix] - 라우트 경로 프리픽스(라우트 생성 시에만)
 * @property {string} [upstreamUrl] - 라우트 업스트림 URL(라우트 생성 시에만)
 * @property {boolean} [enabled] - 라우트 활성화 여부(라우트 생성 시에만)
 */
export interface PostClientApiResponse {
  clientId: string;
  clientSecret: string;
  routeId?: string;
  pathPrefix?: string;
  upstreamUrl?: string;
  enabled?: boolean;
}

/**
 * @public
 * @category Clients
 * @description 본인 소유 OAuth 클라이언트를 셀프 등록합니다. 회원당 최대 5개. `clientSecret`은 1회만 반환됩니다.
 * @param data - 클라이언트 이름·redirectUris(+선택 라우트 pathPrefix/upstreamUrl)
 * @returns 발급된 clientId·clientSecret(+라우트 생성 시 라우트 필드)
 * @example
 * const { clientId, clientSecret } = await postClientApi({ clientName: "에코노 SPA", redirectUris: ["http://localhost:3000/callback"] });
 */
export const postClientApi = async (
  data: ClientApiRequest,
): Promise<PostClientApiResponse> => {
  const response = await apiClient.post<PostClientApiResponse>(
    CLIENTS_API_PATH,
    data,
  );
  return response.data;
};

/**
 * @public
 * @category Types
 * @interface GetClientsApiResponse
 * @description 내 클라이언트 목록 조회 응답.
 * @property {SelfClient[]} clients - 본인 소유 클라이언트 목록(없으면 빈 배열)
 */
export interface GetClientsApiResponse {
  clients: SelfClient[];
}

/**
 * @public
 * @category Clients
 * @description 본인 소유 OAuth 클라이언트 전체 목록을 라우트 정보와 함께 조회합니다. `clientSecret`은 반환되지 않습니다.
 * @returns 내 클라이언트 목록
 * @example
 * const { clients } = await getClientsApi();
 */
export const getClientsApi = async (): Promise<GetClientsApiResponse> => {
  const response = await apiClient.get<GetClientsApiResponse>(CLIENTS_API_PATH);
  return response.data;
};

/**
 * @public
 * @category Types
 * @description 내 클라이언트 단건 조회 응답 타입.
 */
export type GetClientApiResponse = SelfClient;

/**
 * @public
 * @category Clients
 * @description 본인 소유 OAuth 클라이언트 단건을 라우트 정보와 함께 조회합니다. 타인 소유·미존재는 404로 숨김 처리됩니다.
 * @param clientId - 조회할 클라이언트 ID
 * @returns 클라이언트 상세(연결 라우트 포함)
 * @example
 * const client = await getClientApi("a1b2c3d4-...");
 */
export const getClientApi = async (
  clientId: string,
): Promise<GetClientApiResponse> => {
  const response = await apiClient.get<GetClientApiResponse>(
    CLIENT_API_PATH(clientId),
  );
  return response.data;
};

/**
 * @public
 * @category Types
 * @description 내 클라이언트 수정 응답 타입(수정 후 전체 상태).
 */
export type PutClientApiResponse = SelfClient;

/**
 * @public
 * @category Clients
 * @description 본인 소유 OAuth 클라이언트를 전체 표현 교체 방식으로 수정합니다. 백엔드가 diff하여 변경분만 반영하며, `clientSecret` 재발급은 없습니다.
 * `pathPrefix`+`upstreamUrl`을 함께 제공하면 라우트를 upsert하고, 둘 다 생략하면 기존 라우트를 삭제합니다.
 * @param clientId - 수정할 클라이언트 ID
 * @param data - 교체할 전체 표현(clientName·redirectUris + 선택 라우트)
 * @returns 수정 후 클라이언트 상태(연결 라우트 포함)
 * @example
 * const client = await putClientApi("a1b2c3d4-...", { clientName: "에코노 SPA v2", redirectUris: ["http://localhost:3000/callback"] });
 */
export const putClientApi = async (
  clientId: string,
  data: ClientApiRequest,
): Promise<PutClientApiResponse> => {
  const response = await apiClient.put<PutClientApiResponse>(
    CLIENT_API_PATH(clientId),
    data,
  );
  return response.data;
};

/**
 * @public
 * @category Clients
 * @description 본인 소유 OAuth 클라이언트를 Hard 삭제합니다. 클라이언트·SAS 등록정보·연결 라우트가 단일 트랜잭션에서 캐스케이드 삭제됩니다. 타인 소유·미존재는 404로 숨김 처리됩니다.
 * @param clientId - 삭제할 클라이언트 ID
 * @returns 없음(204 No Content)
 * @example
 * await deleteClientApi("a1b2c3d4-...");
 */
export const deleteClientApi = async (clientId: string): Promise<void> => {
  await apiClient.delete(CLIENT_API_PATH(clientId));
};
