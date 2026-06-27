import { http, HttpResponse } from "msw";
import { ADMIN_CLIENTS_API_PATH } from "./constants";
import { db, nextClientId, type ClientRecord } from "./db";
import { errorResponse } from "./errors";
import { getActorRole, hasRoleAtLeast } from "./actor";

/**
 * 그룹 2. 어드민 클라이언트 관리 핸들러 (`context/sso-api/admin-ui.md`).
 *
 * 모든 엔드포인트는 `ADMIN` 이상 역할 필요(`X-Mock-Role`). 권한 부족 시 403 FORBIDDEN.
 */

/** redirectUri 변경 응답(POST/DELETE/PUT 공통): clientId + 갱신된 목록. */
const redirectUrisResponse = (client: ClientRecord) =>
  HttpResponse.json({
    clientId: client.clientId,
    redirectUris: client.redirectUris,
  });

/** 스토어의 클라이언트를 새 redirectUris로 교체(불변 갱신)하고 갱신된 레코드를 반환. */
const replaceClient = (
  clientId: string,
  redirectUris: string[],
): ClientRecord => {
  const updated: ClientRecord = {
    ...db.clients.find((c) => c.clientId === clientId)!,
    redirectUris,
  };
  db.clients = db.clients.map((c) => (c.clientId === clientId ? updated : c));
  return updated;
};

export const adminClientsHandlers = [
  /**
   * POST /api/v1/admin/clients — OAuth 클라이언트 등록.
   * 201 {clientId} / 400 REDIRECT_URI_REQUIRED·VALIDATION_FAILED / 403 FORBIDDEN / 409 DUPLICATE_RESOURCE.
   */
  http.post(`*${ADMIN_CLIENTS_API_PATH}`, async ({ request }) => {
    if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
      return errorResponse("FORBIDDEN");
    }

    let body: { clientName?: unknown; redirectUris?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return errorResponse("VALIDATION_FAILED");
    }

    const { clientName, redirectUris } = body;

    // redirectUris 누락/빈 배열 → REDIRECT_URI_REQUIRED
    if (
      !Array.isArray(redirectUris) ||
      redirectUris.length === 0 ||
      !redirectUris.every((u) => typeof u === "string")
    ) {
      return errorResponse("REDIRECT_URI_REQUIRED");
    }

    // clientName 누락/형식 오류 → VALIDATION_FAILED
    if (typeof clientName !== "string" || clientName.trim().length === 0) {
      return errorResponse("VALIDATION_FAILED");
    }

    // clientName 중복 → DUPLICATE_RESOURCE
    if (db.clients.some((c) => c.clientName === clientName)) {
      return errorResponse("DUPLICATE_RESOURCE");
    }

    const clientId = nextClientId();
    db.clients = [
      ...db.clients,
      { clientId, clientName, redirectUris: [...redirectUris] },
    ];

    return HttpResponse.json({ clientId }, { status: 201 });
  }),

  /**
   * GET /api/v1/admin/clients/{clientId} — 클라이언트 정보 + redirectUri 목록.
   * 200 / 403 FORBIDDEN / 404 NOT_FOUND(미존재).
   */
  http.get(`*${ADMIN_CLIENTS_API_PATH}/:clientId`, ({ request, params }) => {
    if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
      return errorResponse("FORBIDDEN");
    }
    const client = db.clients.find((c) => c.clientId === params.clientId);
    if (!client) {
      return errorResponse("NOT_FOUND");
    }
    return HttpResponse.json(client);
  }),

  /**
   * POST /api/v1/admin/clients/{clientId}/redirect-uris — redirectUri 단건 추가(기존 유지).
   * 200 / 400 VALIDATION_FAILED / 403 FORBIDDEN / 404 NOT_FOUND.
   */
  http.post(
    `*${ADMIN_CLIENTS_API_PATH}/:clientId/redirect-uris`,
    async ({ request, params }) => {
      if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
        return errorResponse("FORBIDDEN");
      }
      const client = db.clients.find((c) => c.clientId === params.clientId);
      if (!client) {
        return errorResponse("NOT_FOUND");
      }

      let body: { uri?: unknown };
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return errorResponse("VALIDATION_FAILED");
      }
      if (typeof body.uri !== "string" || body.uri.trim().length === 0) {
        return errorResponse("VALIDATION_FAILED");
      }

      const uri = body.uri;
      const nextUris = client.redirectUris.includes(uri)
        ? client.redirectUris
        : [...client.redirectUris, uri];
      return redirectUrisResponse(
        replaceClient(client.clientId, nextUris),
      );
    },
  ),

  /**
   * DELETE /api/v1/admin/clients/{clientId}/redirect-uris — redirectUri 단건 삭제.
   * 200 / 400 VALIDATION_FAILED / 403 FORBIDDEN / 404 NOT_FOUND.
   */
  http.delete(
    `*${ADMIN_CLIENTS_API_PATH}/:clientId/redirect-uris`,
    async ({ request, params }) => {
      if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
        return errorResponse("FORBIDDEN");
      }
      const client = db.clients.find((c) => c.clientId === params.clientId);
      if (!client) {
        return errorResponse("NOT_FOUND");
      }

      let body: { uri?: unknown };
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return errorResponse("VALIDATION_FAILED");
      }
      if (typeof body.uri !== "string" || body.uri.trim().length === 0) {
        return errorResponse("VALIDATION_FAILED");
      }

      const nextUris = client.redirectUris.filter((u) => u !== body.uri);
      return redirectUrisResponse(
        replaceClient(client.clientId, nextUris),
      );
    },
  ),

  /**
   * PUT /api/v1/admin/clients/{clientId}/redirect-uris — redirectUri 전체 교체.
   * 200 / 400 VALIDATION_FAILED / 403 FORBIDDEN / 404 NOT_FOUND.
   */
  http.put(
    `*${ADMIN_CLIENTS_API_PATH}/:clientId/redirect-uris`,
    async ({ request, params }) => {
      if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
        return errorResponse("FORBIDDEN");
      }
      const client = db.clients.find((c) => c.clientId === params.clientId);
      if (!client) {
        return errorResponse("NOT_FOUND");
      }

      let body: { uris?: unknown };
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return errorResponse("VALIDATION_FAILED");
      }
      if (
        !Array.isArray(body.uris) ||
        !body.uris.every((u) => typeof u === "string")
      ) {
        return errorResponse("VALIDATION_FAILED");
      }

      return redirectUrisResponse(
        replaceClient(client.clientId, [...body.uris]),
      );
    },
  ),
];
