/**
 * @auth-econovation/api — 공유 API 레이어 배럴.
 *
 * 인증 쿠키 기반 공통 axios 인스턴스(`apiClient`)와 인증 API(login/logout/reissue/signup)
 * 및 그 타입을 노출합니다. web·console이 동일한 클라이언트/타입을 공유합니다.
 *
 * - MSW mock(handlers/db/...)은 번들 분리를 위해 `@auth-econovation/api/mocks`로 분리.
 * - 어드민 API(clients/members)는 `@auth-econovation/api/admin`로 분리(콘솔 핵심).
 */
export { apiClient } from "./client";
export * from "./auth";
