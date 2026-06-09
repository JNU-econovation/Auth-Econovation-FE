/**
 * 로그인 화면 에러 코드 매핑.
 *
 * 키는 SSO 백엔드 명세(`context/sso-api/frontend-auth.md`, `common.md`)의 문자열
 * `errorCode`입니다. 매핑되지 않은 코드는 호출부에서 서버 `message`로 폴백합니다.
 */
const ERROR_CODE_MAP: Record<string, string> = {
  INVALID_CREDENTIALS: "아이디 또는 비밀번호가 올바르지 않습니다.",
  VALIDATION_FAILED: "입력값이 올바르지 않습니다.",
};

/**
 * @public
 * @description 로그인 에러 코드를 사용자 표시 메시지로 변환합니다.
 * @param errorCode - 서버 응답의 명세 errorCode 문자열
 * @returns 매핑된 메시지 또는 null (미매핑 시)
 */
export const getErrorMessageFromCode = (errorCode: string): string | null => {
  return ERROR_CODE_MAP[errorCode] ?? null;
};
