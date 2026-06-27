/**
 * @auth-econovation/api/admin — 어드민 API 배럴(클라이언트 등록/관리 + 회원 역할 관리).
 *
 * 콘솔(@auth-econovation/console)의 핵심 백엔드 계약입니다. 경로 상수·요청 함수·타입을
 * api-guide 규칙(대문자 경로 상수, `XxxApiResponse`, `xxxApi`, JSDoc)에 맞춰 노출합니다.
 */
export * from "./types";
export * from "./clients";
export * from "./members";
export * from "./routes";
