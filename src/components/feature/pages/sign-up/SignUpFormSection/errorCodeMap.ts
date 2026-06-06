type FieldName = "name" | "id" | "password" | "generation" | "activeStatus";

interface FieldError {
  field: FieldName;
  message: string;
}

/**
 * 회원가입 화면 에러 코드 → 필드 에러 매핑.
 *
 * 키는 SSO 백엔드 명세(`context/sso-api/frontend-auth.md`, `common.md`)의 문자열
 * `errorCode`입니다. 명세상 회원가입 실패 코드는 다음 3가지뿐입니다.
 * - `MEMBER_ALREADY_EXISTS` (409): loginId 중복 → id 필드
 * - `INVALID_PASSWORD_POLICY` (400): 비밀번호 정책 위반 → password 필드
 * - `VALIDATION_FAILED` (400): 필수 필드 누락/형식 오류 — **어느 필드인지 명세에 없으므로**
 *   특정 필드로 매핑하지 않고(매핑 미존재 → null) 호출부에서 서버 message로 안내합니다.
 */
const ERROR_CODE_MAP: Record<string, FieldError> = {
  MEMBER_ALREADY_EXISTS: {
    field: "id",
    message: "이미 사용 중인 아이디입니다.",
  },
  INVALID_PASSWORD_POLICY: {
    field: "password",
    message: "비밀번호 정책을 위반했습니다.",
  },
};

/**
 * @public
 * @description 명세 errorCode를 특정 필드 에러로 변환합니다.
 * @param errorCode - 서버 응답의 명세 errorCode 문자열
 * @param serverMessage - 서버 응답 메시지 (필드별 기본 메시지가 없을 때 폴백)
 * @returns 필드 이름과 에러 메시지, 또는 null (특정 필드로 매핑되지 않는 경우)
 */
export const getFieldErrorFromCode = (
  errorCode: string,
  serverMessage: string
): { field: FieldName; message: string } | null => {
  const mapped = ERROR_CODE_MAP[errorCode];
  if (!mapped) return null;

  return { field: mapped.field, message: mapped.message || serverMessage };
};
