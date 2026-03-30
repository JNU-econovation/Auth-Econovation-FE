const ERROR_CODE_MAP: Record<number, string> = {
  4008: "ID 또는 비밀번호가 일치하지 않습니다",
};

/**
 * @public
 * @description 로그인 에러 코드를 에러 메시지로 변환합니다
 * @param code - 서버 에러 코드
 * @returns 에러 메시지 또는 null
 */
export const getErrorMessageFromCode = (code: number): string | null => {
  return ERROR_CODE_MAP[code] ?? null;
};
