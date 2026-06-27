import { apiClient } from "../../client";

/**
 * @public
 * @category Constants
 * @description 동적 라우트 목록/등록 API 경로 (`GET·POST /api/v1/admin/routes`)
 */
export const ADMIN_ROUTES_API_PATH = "/api/v1/admin/routes";

/**
 * @public
 * @category Constants
 * @description 단건 라우트 API 경로를 생성하는 함수 (`GET·PUT·DELETE /api/v1/admin/routes/{routeId}`)
 * @param routeId - 라우트 ID
 * @returns API 경로 문자열
 */
export const ADMIN_ROUTE_API_PATH = (routeId: string) =>
  `/api/v1/admin/routes/${routeId}`;

/**
 * @public
 * @category Types
 * @interface AdminRoute
 * @description Gateway 동적 라우트 상세.
 * @property {string} routeId - 라우트 ID
 * @property {string} pathPrefix - 경로 프리픽스
 * @property {string} upstreamUrl - 업스트림(대상) URL
 * @property {boolean} enabled - 활성화 여부
 * @property {string} createdAt - 생성 일시(ISO 8601)
 * @property {string} updatedAt - 수정 일시(ISO 8601)
 */
export interface AdminRoute {
  routeId: string;
  pathPrefix: string;
  upstreamUrl: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * @public
 * @category Types
 * @interface AdminRouteApiRequest
 * @description 라우트 등록/수정 요청 바디(`POST`·`PUT` 공통).
 * @property {string} pathPrefix - 경로 프리픽스
 * @property {string} upstreamUrl - 업스트림(대상) URL
 * @property {boolean} enabled - 활성화 여부
 */
export interface AdminRouteApiRequest {
  pathPrefix: string;
  upstreamUrl: string;
  enabled: boolean;
}

/**
 * @public
 * @category Types
 * @interface GetAdminRoutesApiResponse
 * @description 라우트 목록 조회 응답.
 * @property {AdminRoute[]} routes - 등록된 전체 라우트 목록
 */
export interface GetAdminRoutesApiResponse {
  routes: AdminRoute[];
}

/**
 * @public
 * @category AdminRoutes
 * @description 등록된 전체 동적 라우트 목록을 조회합니다. `ADMIN` 이상 권한 필요.
 * @returns 라우트 목록
 * @example
 * const { routes } = await getAdminRoutesApi();
 */
export const getAdminRoutesApi =
  async (): Promise<GetAdminRoutesApiResponse> => {
    const response = await apiClient.get<GetAdminRoutesApiResponse>(
      ADMIN_ROUTES_API_PATH,
    );
    return response.data;
  };

/**
 * @public
 * @category Types
 * @description 라우트 등록 응답 타입(생성된 라우트 상세).
 */
export type PostAdminRouteApiResponse = AdminRoute;

/**
 * @public
 * @category AdminRoutes
 * @description 새 동적 라우트를 등록하고 게이트웨이에 즉시 반영합니다. `ADMIN` 이상 권한 필요.
 * @param data - pathPrefix/upstreamUrl/enabled
 * @returns 생성된 라우트 상세(발급된 routeId 포함)
 * @example
 * const route = await postAdminRouteApi({ pathPrefix: "/api/v1/myservice", upstreamUrl: "http://myservice:8080", enabled: true });
 */
export const postAdminRouteApi = async (
  data: AdminRouteApiRequest,
): Promise<PostAdminRouteApiResponse> => {
  const response = await apiClient.post<PostAdminRouteApiResponse>(
    ADMIN_ROUTES_API_PATH,
    data,
  );
  return response.data;
};

/**
 * @public
 * @category Types
 * @description 단건 라우트 조회 응답 타입.
 */
export type GetAdminRouteApiResponse = AdminRoute;

/**
 * @public
 * @category AdminRoutes
 * @description 특정 라우트를 단건 조회합니다. `ADMIN` 이상 권한 필요.
 * @param routeId - 조회할 라우트 ID
 * @returns 라우트 상세
 * @example
 * const route = await getAdminRouteApi("550e8400-...");
 */
export const getAdminRouteApi = async (
  routeId: string,
): Promise<GetAdminRouteApiResponse> => {
  const response = await apiClient.get<GetAdminRouteApiResponse>(
    ADMIN_ROUTE_API_PATH(routeId),
  );
  return response.data;
};

/**
 * @public
 * @category Types
 * @description 라우트 수정 응답 타입(수정 후 라우트 상태).
 */
export type PutAdminRouteApiResponse = AdminRoute;

/**
 * @public
 * @category AdminRoutes
 * @description 라우트의 pathPrefix/upstreamUrl/enabled를 변경하고 게이트웨이에 즉시 반영합니다. `ADMIN` 이상 권한 필요.
 * @param routeId - 수정할 라우트 ID
 * @param data - 변경할 pathPrefix/upstreamUrl/enabled
 * @returns 수정 후 라우트 상태
 * @example
 * const route = await putAdminRouteApi("550e8400-...", { pathPrefix: "/api/v1/board-v2", upstreamUrl: "http://board-service:8080", enabled: false });
 */
export const putAdminRouteApi = async (
  routeId: string,
  data: AdminRouteApiRequest,
): Promise<PutAdminRouteApiResponse> => {
  const response = await apiClient.put<PutAdminRouteApiResponse>(
    ADMIN_ROUTE_API_PATH(routeId),
    data,
  );
  return response.data;
};

/**
 * @public
 * @category AdminRoutes
 * @description 라우트를 삭제하고 게이트웨이에 즉시 반영합니다. 보호 경로는 삭제할 수 없습니다. `ADMIN` 이상 권한 필요.
 * @param routeId - 삭제할 라우트 ID
 * @returns 없음(204 No Content)
 * @example
 * await deleteAdminRouteApi("550e8400-...");
 */
export const deleteAdminRouteApi = async (routeId: string): Promise<void> => {
  await apiClient.delete(ADMIN_ROUTE_API_PATH(routeId));
};
