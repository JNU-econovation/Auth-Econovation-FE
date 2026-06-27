import { http, HttpResponse } from "msw";
import { CLIENTS_API_PATH } from "./constants";
import {
  db,
  nextClientId,
  nextClientSecret,
  nextRouteId,
  toSelfClientView,
  type ClientRecord,
  type RouteRecord,
} from "./db";
import { errorResponse, type ErrorCode } from "./errors";
import { getActorMemberId } from "./actor";
import {
  extractNamespace,
  isValidNamespacePrefix,
  isValidUpstreamUrl,
} from "./routeRules";

/**
 * 그룹 6. 회원 셀프 OAuth 클라이언트 관리 핸들러 (`context/api-docs/console/clients-self-*.md`).
 *
 * 인증된 회원이 **본인 소유** 클라이언트를 직접 관리합니다. 요청자 신원은 `X-Mock-Member-Id`
 * 헤더로 주입합니다(`./actor`, 미지정 시 id 1). 타인 소유·미존재 `clientId`는 모두 404
 * CLIENT_NOT_FOUND로 숨김 처리합니다. `pathPrefix`+`upstreamUrl`을 함께 제공하면 Gateway
 * 동적 라우트(`./db`의 `routes`)를 같은 트랜잭션에서 함께 처리합니다.
 */

/** 회원당 최대 클라이언트 개수. */
const MAX_CLIENTS_PER_MEMBER = 5;

interface ClientBody {
  clientName: string;
  redirectUris: string[];
  /** pathPrefix·upstreamUrl 둘 다 제공 시에만 존재(라우트 동반 처리). */
  route: { pathPrefix: string; upstreamUrl: string } | null;
}

type Validated<T> = { ok: true; value: T } | { ok: false; code: ErrorCode };

/**
 * 등록/수정 공통 바디 검증. 필수 필드·라우트 페어·네임스페이스·업스트림을 검사합니다.
 * 충돌(중복/선점)처럼 스토어 상태에 의존하는 검사는 각 핸들러에서 별도로 수행합니다.
 */
const validateClientBody = (raw: unknown): Validated<ClientBody> => {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, code: "VALIDATION_FAILED" };
  }
  const { clientName, redirectUris, pathPrefix, upstreamUrl } =
    raw as Record<string, unknown>;

  // redirectUris: 비어 있지 않은 문자열 배열(필수)
  if (
    !Array.isArray(redirectUris) ||
    redirectUris.length === 0 ||
    !redirectUris.every((u) => typeof u === "string")
  ) {
    return { ok: false, code: "REDIRECT_URI_REQUIRED" };
  }

  // clientName: 비어 있지 않은 문자열
  if (typeof clientName !== "string" || clientName.trim().length === 0) {
    return { ok: false, code: "VALIDATION_FAILED" };
  }

  // 라우트 페어: 둘 다 있거나 둘 다 없어야 함(하나만 제공 시 VALIDATION_FAILED)
  const hasPath = typeof pathPrefix === "string" && pathPrefix.length > 0;
  const hasUpstream =
    typeof upstreamUrl === "string" && upstreamUrl.length > 0;
  if (hasPath !== hasUpstream) {
    return { ok: false, code: "VALIDATION_FAILED" };
  }

  if (hasPath && hasUpstream) {
    if (!isValidNamespacePrefix(pathPrefix as string)) {
      return { ok: false, code: "ROUTE_NAMESPACE_INVALID" };
    }
    if (!isValidUpstreamUrl(upstreamUrl as string)) {
      return { ok: false, code: "ROUTE_UPSTREAM_INVALID" };
    }
  }

  return {
    ok: true,
    value: {
      clientName,
      redirectUris: [...(redirectUris as string[])],
      route:
        hasPath && hasUpstream
          ? {
              pathPrefix: pathPrefix as string,
              upstreamUrl: upstreamUrl as string,
            }
          : null,
    },
  };
};

/** 요청 라우트가 보호 경로(네임스페이스 동일 또는 prefix 동일)와 충돌하는지. */
const conflictsWithProtected = (pathPrefix: string): boolean => {
  const namespace = extractNamespace(pathPrefix);
  return db.routes.some(
    (r) =>
      r.protected &&
      (r.pathPrefix === pathPrefix || extractNamespace(r.pathPrefix) === namespace),
  );
};

/**
 * 라우트 충돌 검사(소유권/중복). `selfRouteId`는 수정 시 자기 자신을 제외하기 위한 현재 라우트 ID.
 * 충돌 시 에러 코드를, 없으면 null을 반환합니다.
 */
const routeConflictCode = (
  pathPrefix: string,
  ownerId: number,
  selfRouteId?: string,
): ErrorCode | null => {
  if (conflictsWithProtected(pathPrefix)) {
    return "ROUTE_PROTECTED";
  }
  const namespace = extractNamespace(pathPrefix);
  // 다른 회원이 같은 네임스페이스를 선점한 경우(셀프 등록 라우트만 소유자 보유)
  if (
    db.routes.some(
      (r) =>
        r.routeId !== selfRouteId &&
        r.ownerId !== undefined &&
        r.ownerId !== ownerId &&
        extractNamespace(r.pathPrefix) === namespace,
    )
  ) {
    return "ROUTE_NAMESPACE_TAKEN";
  }
  // pathPrefix 정확 중복(seed 포함, 자기 자신 제외)
  if (
    db.routes.some(
      (r) => r.routeId !== selfRouteId && r.pathPrefix === pathPrefix,
    )
  ) {
    return "ROUTE_PATH_CONFLICT";
  }
  return null;
};

export const selfClientsHandlers = [
  /**
   * POST /api/v1/clients — 셀프 클라이언트 등록.
   * 201 {clientId, clientSecret, (route...)} / 400 / 403 / 409 / 422 CLIENT_LIMIT_EXCEEDED.
   */
  http.post(`*${CLIENTS_API_PATH}`, async ({ request }) => {
    const ownerId = getActorMemberId(request);

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return errorResponse("VALIDATION_FAILED");
    }

    const validated = validateClientBody(raw);
    if (!validated.ok) {
      return errorResponse(validated.code);
    }
    const { clientName, redirectUris, route } = validated.value;

    // 회원당 최대 5개
    const ownedCount = db.clients.filter((c) => c.ownerId === ownerId).length;
    if (ownedCount >= MAX_CLIENTS_PER_MEMBER) {
      return errorResponse("CLIENT_LIMIT_EXCEEDED");
    }

    // clientName 중복(전역)
    if (db.clients.some((c) => c.clientName === clientName)) {
      return errorResponse("DUPLICATE_CLIENT_NAME");
    }

    // 라우트 동반 생성 시 충돌 검사
    if (route) {
      const conflict = routeConflictCode(route.pathPrefix, ownerId);
      if (conflict) {
        return errorResponse(conflict);
      }
    }

    const clientId = nextClientId();
    const clientSecret = nextClientSecret();

    let createdRoute: RouteRecord | null = null;
    if (route) {
      const now = new Date().toISOString();
      createdRoute = {
        routeId: nextRouteId(),
        pathPrefix: route.pathPrefix,
        upstreamUrl: route.upstreamUrl,
        enabled: true,
        createdAt: now,
        updatedAt: now,
        ownerId,
      };
      db.routes = [...db.routes, createdRoute];
    }

    const client: ClientRecord = {
      clientId,
      clientName,
      redirectUris,
      ownerId,
      clientSecret,
      routeId: createdRoute ? createdRoute.routeId : null,
    };
    db.clients = [...db.clients, client];

    return HttpResponse.json(
      {
        clientId,
        clientSecret,
        ...(createdRoute
          ? {
              routeId: createdRoute.routeId,
              pathPrefix: createdRoute.pathPrefix,
              upstreamUrl: createdRoute.upstreamUrl,
              enabled: createdRoute.enabled,
            }
          : {}),
      },
      { status: 201 },
    );
  }),

  /**
   * GET /api/v1/clients — 내 클라이언트 목록(라우트 포함, clientSecret 미반환).
   * 200 {clients}.
   */
  http.get(`*${CLIENTS_API_PATH}`, ({ request }) => {
    const ownerId = getActorMemberId(request);
    const clients = db.clients
      .filter((c) => c.ownerId === ownerId)
      .map(toSelfClientView);
    return HttpResponse.json({ clients });
  }),

  /**
   * GET /api/v1/clients/{clientId} — 내 클라이언트 단건(라우트 포함).
   * 200 / 404 CLIENT_NOT_FOUND(미존재·타인 소유).
   */
  http.get(`*${CLIENTS_API_PATH}/:clientId`, ({ request, params }) => {
    const ownerId = getActorMemberId(request);
    const client = db.clients.find(
      (c) => c.clientId === params.clientId && c.ownerId === ownerId,
    );
    if (!client) {
      return errorResponse("CLIENT_NOT_FOUND");
    }
    return HttpResponse.json(toSelfClientView(client));
  }),

  /**
   * PUT /api/v1/clients/{clientId} — 내 클라이언트 수정(전체 표현 교체).
   * 200 / 400 / 403 / 404 CLIENT_NOT_FOUND / 409. 라우트는 제공 시 upsert, 생략 시 삭제.
   */
  http.put(`*${CLIENTS_API_PATH}/:clientId`, async ({ request, params }) => {
    const ownerId = getActorMemberId(request);
    const client = db.clients.find(
      (c) => c.clientId === params.clientId && c.ownerId === ownerId,
    );
    if (!client) {
      return errorResponse("CLIENT_NOT_FOUND");
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return errorResponse("VALIDATION_FAILED");
    }

    const validated = validateClientBody(raw);
    if (!validated.ok) {
      return errorResponse(validated.code);
    }
    const { clientName, redirectUris, route } = validated.value;

    const existingRoute = client.routeId
      ? db.routes.find((r) => r.routeId === client.routeId) ?? null
      : null;

    if (route) {
      // 기존 라우트의 네임스페이스는 변경할 수 없음
      if (
        existingRoute &&
        extractNamespace(existingRoute.pathPrefix) !==
          extractNamespace(route.pathPrefix)
      ) {
        return errorResponse("ROUTE_NAMESPACE_CHANGE_DENIED");
      }
      const conflict = routeConflictCode(
        route.pathPrefix,
        ownerId,
        existingRoute?.routeId,
      );
      if (conflict) {
        return errorResponse(conflict);
      }
    }

    // clientName 중복(다른 클라이언트)
    if (
      db.clients.some(
        (c) => c.clientId !== client.clientId && c.clientName === clientName,
      )
    ) {
      return errorResponse("DUPLICATE_CLIENT_NAME");
    }

    // 라우트 diff: 제공 시 upsert, 생략 시 기존 라우트 삭제
    let nextRouteIdValue: string | null = client.routeId ?? null;
    if (route) {
      const now = new Date().toISOString();
      if (existingRoute) {
        const updatedRoute: RouteRecord = {
          ...existingRoute,
          pathPrefix: route.pathPrefix,
          upstreamUrl: route.upstreamUrl,
          updatedAt: now,
        };
        db.routes = db.routes.map((r) =>
          r.routeId === existingRoute.routeId ? updatedRoute : r,
        );
        nextRouteIdValue = updatedRoute.routeId;
      } else {
        const createdRoute: RouteRecord = {
          routeId: nextRouteId(),
          pathPrefix: route.pathPrefix,
          upstreamUrl: route.upstreamUrl,
          enabled: true,
          createdAt: now,
          updatedAt: now,
          ownerId,
        };
        db.routes = [...db.routes, createdRoute];
        nextRouteIdValue = createdRoute.routeId;
      }
    } else if (existingRoute) {
      db.routes = db.routes.filter((r) => r.routeId !== existingRoute.routeId);
      nextRouteIdValue = null;
    }

    const updatedClient: ClientRecord = {
      ...client,
      clientName,
      redirectUris,
      routeId: nextRouteIdValue,
    };
    db.clients = db.clients.map((c) =>
      c.clientId === client.clientId ? updatedClient : c,
    );

    return HttpResponse.json(toSelfClientView(updatedClient));
  }),

  /**
   * DELETE /api/v1/clients/{clientId} — 내 클라이언트 Hard 삭제(연결 라우트 캐스케이드).
   * 204 / 404 CLIENT_NOT_FOUND(미존재·타인 소유).
   */
  http.delete(`*${CLIENTS_API_PATH}/:clientId`, ({ request, params }) => {
    const ownerId = getActorMemberId(request);
    const client = db.clients.find(
      (c) => c.clientId === params.clientId && c.ownerId === ownerId,
    );
    if (!client) {
      return errorResponse("CLIENT_NOT_FOUND");
    }

    db.clients = db.clients.filter((c) => c.clientId !== client.clientId);
    if (client.routeId) {
      db.routes = db.routes.filter((r) => r.routeId !== client.routeId);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
