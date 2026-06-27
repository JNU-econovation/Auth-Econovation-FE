import { http, HttpResponse } from "msw";
import { ADMIN_ROUTES_API_PATH } from "./constants";
import { db, nextRouteId, toAdminRouteView, type RouteRecord } from "./db";
import { errorResponse } from "./errors";
import { getActorRole, hasRoleAtLeast } from "./actor";
import { isValidUpstreamUrl } from "./routeRules";

/**
 * 그룹 5. 어드민 동적 라우트 관리 핸들러 (`context/api-docs/console/routes-*.md`).
 *
 * 모든 엔드포인트는 `ADMIN` 이상 역할 필요(`X-Mock-Role`). 권한 부족 시 403 FORBIDDEN.
 * 라우트 상태는 `./db`의 `routes` 컬렉션을 공유하며(셀프 클라이언트가 생성한 라우트 포함),
 * 보호 경로(seed `protected`)는 수정·삭제 시 403 ROUTE_PROTECTED.
 */

/** 등록/수정 요청 바디의 형식을 검증합니다(필수 필드·타입). */
const isValidRouteBody = (
  body: unknown,
): body is { pathPrefix: string; upstreamUrl: string; enabled: boolean } => {
  if (typeof body !== "object" || body === null) return false;
  const { pathPrefix, upstreamUrl, enabled } = body as Record<string, unknown>;
  return (
    typeof pathPrefix === "string" &&
    pathPrefix.trim().length > 0 &&
    typeof upstreamUrl === "string" &&
    upstreamUrl.trim().length > 0 &&
    typeof enabled === "boolean"
  );
};

export const adminRoutesHandlers = [
  /**
   * GET /api/v1/admin/routes — 등록된 전체 라우트 목록.
   * 200 {routes} / 403 FORBIDDEN.
   */
  http.get(`*${ADMIN_ROUTES_API_PATH}`, ({ request }) => {
    if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
      return errorResponse("FORBIDDEN");
    }
    return HttpResponse.json({ routes: db.routes.map(toAdminRouteView) });
  }),

  /**
   * POST /api/v1/admin/routes — 동적 라우트 등록.
   * 201 / 400 VALIDATION_FAILED·ROUTE_UPSTREAM_INVALID / 403 FORBIDDEN / 409 ROUTE_PATH_CONFLICT.
   */
  http.post(`*${ADMIN_ROUTES_API_PATH}`, async ({ request }) => {
    if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
      return errorResponse("FORBIDDEN");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("VALIDATION_FAILED");
    }
    if (!isValidRouteBody(body)) {
      return errorResponse("VALIDATION_FAILED");
    }
    if (!isValidUpstreamUrl(body.upstreamUrl)) {
      return errorResponse("ROUTE_UPSTREAM_INVALID");
    }
    if (db.routes.some((r) => r.pathPrefix === body.pathPrefix)) {
      return errorResponse("ROUTE_PATH_CONFLICT");
    }

    const now = new Date().toISOString();
    const route: RouteRecord = {
      routeId: nextRouteId(),
      pathPrefix: body.pathPrefix,
      upstreamUrl: body.upstreamUrl,
      enabled: body.enabled,
      createdAt: now,
      updatedAt: now,
    };
    db.routes = [...db.routes, route];

    return HttpResponse.json(toAdminRouteView(route), { status: 201 });
  }),

  /**
   * GET /api/v1/admin/routes/{routeId} — 단건 라우트 조회.
   * 200 / 403 FORBIDDEN / 404 ROUTE_NOT_FOUND.
   */
  http.get(`*${ADMIN_ROUTES_API_PATH}/:routeId`, ({ request, params }) => {
    if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
      return errorResponse("FORBIDDEN");
    }
    const route = db.routes.find((r) => r.routeId === params.routeId);
    if (!route) {
      return errorResponse("ROUTE_NOT_FOUND");
    }
    return HttpResponse.json(toAdminRouteView(route));
  }),

  /**
   * PUT /api/v1/admin/routes/{routeId} — 라우트 수정.
   * 200 / 400 VALIDATION_FAILED·ROUTE_UPSTREAM_INVALID / 403 FORBIDDEN·ROUTE_PROTECTED /
   * 404 ROUTE_NOT_FOUND / 409 ROUTE_PATH_CONFLICT.
   */
  http.put(
    `*${ADMIN_ROUTES_API_PATH}/:routeId`,
    async ({ request, params }) => {
      if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
        return errorResponse("FORBIDDEN");
      }
      const route = db.routes.find((r) => r.routeId === params.routeId);
      if (!route) {
        return errorResponse("ROUTE_NOT_FOUND");
      }
      if (route.protected) {
        return errorResponse("ROUTE_PROTECTED");
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return errorResponse("VALIDATION_FAILED");
      }
      if (!isValidRouteBody(body)) {
        return errorResponse("VALIDATION_FAILED");
      }
      if (!isValidUpstreamUrl(body.upstreamUrl)) {
        return errorResponse("ROUTE_UPSTREAM_INVALID");
      }
      // 다른 라우트와의 pathPrefix 충돌만 차단(자기 자신은 허용).
      if (
        db.routes.some(
          (r) =>
            r.routeId !== route.routeId && r.pathPrefix === body.pathPrefix,
        )
      ) {
        return errorResponse("ROUTE_PATH_CONFLICT");
      }

      const updated: RouteRecord = {
        ...route,
        pathPrefix: body.pathPrefix,
        upstreamUrl: body.upstreamUrl,
        enabled: body.enabled,
        updatedAt: new Date().toISOString(),
      };
      db.routes = db.routes.map((r) =>
        r.routeId === route.routeId ? updated : r,
      );

      return HttpResponse.json(toAdminRouteView(updated));
    },
  ),

  /**
   * DELETE /api/v1/admin/routes/{routeId} — 라우트 삭제.
   * 204 / 403 FORBIDDEN·ROUTE_PROTECTED / 404 ROUTE_NOT_FOUND.
   * 삭제 시 이 라우트를 참조하던 클라이언트의 연결도 함께 끊습니다.
   */
  http.delete(`*${ADMIN_ROUTES_API_PATH}/:routeId`, ({ request, params }) => {
    if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
      return errorResponse("FORBIDDEN");
    }
    const route = db.routes.find((r) => r.routeId === params.routeId);
    if (!route) {
      return errorResponse("ROUTE_NOT_FOUND");
    }
    if (route.protected) {
      return errorResponse("ROUTE_PROTECTED");
    }

    db.routes = db.routes.filter((r) => r.routeId !== route.routeId);
    db.clients = db.clients.map((c) =>
      c.routeId === route.routeId ? { ...c, routeId: null } : c,
    );

    return new HttpResponse(null, { status: 204 });
  }),
];
