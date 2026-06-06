import { HttpResponse } from "msw";
import type { ApiErrorResponse } from "@/api/auth/types";

/**
 * SSO 백엔드 명세(`context/sso-api/common.md`)의 에러 응답 스키마.
 * API 레이어의 `ApiErrorResponse`(명세 정렬됨)와 동일합니다.
 */
export type SpecApiError = ApiErrorResponse;

/**
 * 명세 공통 에러 코드 → (HTTP 상태, 기본 메시지) 카탈로그.
 * `context/sso-api/common.md`의 "공통 에러 코드" 표와 1:1로 정렬됩니다.
 */
export const ERROR_CATALOG = {
  VALIDATION_FAILED: { status: 400, message: "요청 값이 올바르지 않습니다." },
  INVALID_PASSWORD_POLICY: {
    status: 400,
    message: "비밀번호 정책을 위반했습니다.",
  },
  REDIRECT_URI_REQUIRED: {
    status: 400,
    message: "redirectUris는 필수입니다.",
  },
  INVALID_ROLE: {
    status: 400,
    message: "유효하지 않은 역할입니다. 허용: USER, ADMIN, SUPER_ADMIN",
  },
  INVALID_CREDENTIALS: {
    status: 401,
    message: "아이디 또는 비밀번호가 올바르지 않습니다.",
  },
  REFRESH_TOKEN_MISSING: {
    status: 401,
    message: "Refresh token이 없습니다.",
  },
  REFRESH_TOKEN_INVALID: {
    status: 401,
    message: "유효하지 않은 Refresh token입니다.",
  },
  FORBIDDEN: { status: 403, message: "관리자 권한이 필요합니다." },
  FORBIDDEN_SELF_ROLE_CHANGE: {
    status: 403,
    message: "본인의 역할은 변경할 수 없습니다.",
  },
  NOT_FOUND: { status: 404, message: "존재하지 않는 리소스입니다." },
  MEMBER_ALREADY_EXISTS: {
    status: 409,
    message: "이미 사용 중인 loginId입니다.",
  },
  DUPLICATE_RESOURCE: {
    status: 409,
    message: "이미 사용 중인 clientName입니다.",
  },
  LAST_SUPER_ADMIN_CANNOT_BE_DEMOTED: {
    status: 409,
    message: "마지막 SUPER_ADMIN은 해제할 수 없습니다.",
  },
} as const;

/** 명세에 정의된 에러 코드 유니온. */
export type ErrorCode = keyof typeof ERROR_CATALOG;

/**
 * @description 명세 스키마(`{ errorCode, message, timestamp }`)에 맞는 에러 응답을 생성합니다.
 * @param code - 명세 에러 코드 (HTTP 상태와 기본 메시지가 카탈로그에서 결정됨)
 * @param message - 기본 메시지를 덮어쓸 커스텀 메시지(선택)
 * @returns MSW `HttpResponse` (해당 HTTP 상태 + JSON 바디)
 */
export const errorResponse = (code: ErrorCode, message?: string) => {
  const { status, message: defaultMessage } = ERROR_CATALOG[code];
  const body: SpecApiError = {
    errorCode: code,
    message: message ?? defaultMessage,
    // 명세 예시 형식(`2026-06-03T18:00:00`)에 맞춰 밀리초/타임존 표기를 제거합니다.
    timestamp: new Date().toISOString().slice(0, 19),
  };
  return HttpResponse.json(body, { status });
};
