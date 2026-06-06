import { http, HttpResponse } from "msw";
import { ADMIN_MEMBERS_API_PATH } from "./constants";
import {
  db,
  toAdminMemberView,
  type MemberRecord,
  type Role,
} from "./db";
import { errorResponse } from "./errors";
import {
  getActorMemberId,
  getActorRole,
  hasRoleAtLeast,
} from "./actor";

/**
 * 그룹 3. 어드민 회원 역할 관리 핸들러 (`context/sso-api/admin-ui.md`).
 *
 * - 목록 조회: `ADMIN` 이상.
 * - 역할 변경: `SUPER_ADMIN` 전용.
 */

const ROLES = new Set<Role>(["USER", "ADMIN", "SUPER_ADMIN"]);

/** 역할 문자열을 대소문자 무관하게 파싱(명세: 대소문자 무관). 유효하지 않으면 null. */
const parseRole = (value: unknown): Role | null => {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return ROLES.has(upper as Role) ? (upper as Role) : null;
};

export const adminMembersHandlers = [
  /**
   * GET /api/v1/admin/members — 회원 목록(페이지네이션).
   * 쿼리: page(기본 0) / size(기본 20) / role(선택 필터). 200 / 403 FORBIDDEN.
   */
  http.get(`*${ADMIN_MEMBERS_API_PATH}`, ({ request }) => {
    if (!hasRoleAtLeast(getActorRole(request), "ADMIN")) {
      return errorResponse("FORBIDDEN");
    }

    const url = new URL(request.url);
    const page = Math.max(0, Number(url.searchParams.get("page") ?? "0") || 0);
    const size = Math.max(1, Number(url.searchParams.get("size") ?? "20") || 20);
    const roleFilter = parseRole(url.searchParams.get("role"));

    const filtered = roleFilter
      ? db.members.filter((m) => m.role === roleFilter)
      : db.members;

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const content = filtered.slice(start, start + size).map(toAdminMemberView);

    return HttpResponse.json({
      content,
      totalElements,
      totalPages,
      page,
      size,
    });
  }),

  /**
   * PATCH /api/v1/admin/members/{memberId}/role — 역할 변경(SUPER_ADMIN 전용).
   * 200 / 400 INVALID_ROLE / 403 FORBIDDEN·FORBIDDEN_SELF_ROLE_CHANGE /
   * 404 NOT_FOUND / 409 LAST_SUPER_ADMIN_CANNOT_BE_DEMOTED.
   */
  http.patch(
    `*${ADMIN_MEMBERS_API_PATH}/:memberId/role`,
    async ({ request, params }) => {
      // 검증 순서: 권한/소유권/존재(403·404 계열)를 입력값 검증(400 INVALID_ROLE)보다 먼저
      // 확인합니다. (예: 미존재 회원 + 잘못된 role → NOT_FOUND가 INVALID_ROLE보다 우선)

      // 1) 권한: SUPER_ADMIN 전용
      if (getActorRole(request) !== "SUPER_ADMIN") {
        return errorResponse("FORBIDDEN");
      }

      // 2) 대상 존재 여부
      const memberId = Number(params.memberId);
      const target = db.members.find((m) => m.memberId === memberId);
      if (!target) {
        return errorResponse("NOT_FOUND");
      }

      // 3) 본인 역할 변경 차단
      if (memberId === getActorMemberId(request)) {
        return errorResponse("FORBIDDEN_SELF_ROLE_CHANGE");
      }

      // 4) 역할 값 검증
      let body: { role?: unknown };
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return errorResponse("INVALID_ROLE");
      }
      const nextRole = parseRole(body.role);
      if (!nextRole) {
        return errorResponse("INVALID_ROLE");
      }

      // 5) 마지막 SUPER_ADMIN 강등 차단
      const superAdminCount = db.members.filter(
        (m) => m.role === "SUPER_ADMIN",
      ).length;
      if (
        target.role === "SUPER_ADMIN" &&
        nextRole !== "SUPER_ADMIN" &&
        superAdminCount <= 1
      ) {
        return errorResponse("LAST_SUPER_ADMIN_CANNOT_BE_DEMOTED");
      }

      const updated: MemberRecord = { ...target, role: nextRole };
      db.members = db.members.map((m) =>
        m.memberId === memberId ? updated : m,
      );

      return HttpResponse.json({ memberId, role: nextRole });
    },
  ),
];
