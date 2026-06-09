/**
 * @auth-econovation/api/mocks — 환경 비의존(브라우저·노드 공용) MSW 자원 배럴.
 *
 * 핸들러/인메모리 스토어/에러 카탈로그/경로 상수/역할 actor 유틸을 노출합니다.
 * 환경 의존 인스턴스는 번들 격리를 위해 서브경로로 분리합니다.
 * - 노드(테스트): `@auth-econovation/api/mocks/server` (`server`)
 * - 브라우저(개발 런타임): `@auth-econovation/api/mocks/browser` (`worker`)
 */
export {
  handlers,
  LOGIN_SUCCESS_RESPONSE,
  LOGIN_INVALID_CREDENTIALS,
} from "./handlers";

export {
  db,
  resetDb,
  nextClientId,
  toAdminMemberView,
  toPublicMemberView,
} from "./db";
export type { Role, MemberRecord, ClientRecord } from "./db";

export { errorResponse, ERROR_CATALOG } from "./errors";
export type { ErrorCode, SpecApiError } from "./errors";

export { getActorRole, getActorMemberId, hasRoleAtLeast } from "./actor";

// 경로 상수(SIGN_*_API_PATH 재노출 + ADMIN_*/MEMBERS_BATCH) · 모의 토큰 · 역할 헤더
export * from "./constants";
