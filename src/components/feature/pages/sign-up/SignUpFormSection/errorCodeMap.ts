type FieldName = "name" | "id" | "password" | "generation" | "activeStatus";

interface FieldError {
  field: FieldName;
  message: string | null;
}

const ERROR_CODE_MAP: Record<number, FieldError> = {
  4100: { field: "name", message: "이름이 유효하지 않습니다." },
  4101: { field: "id", message: "아이디가 유효하지 않습니다." },
  4102: { field: "id", message: "이미 사용 중인 아이디입니다." },
  4103: { field: "password", message: "비밀번호가 유효하지 않습니다." },
  4104: { field: "generation", message: "기수가 유효하지 않습니다." },
  4105: { field: "name", message: "이름은 필수 항목입니다." },
  4106: { field: "id", message: "아이디는 필수 항목입니다." },
  4107: { field: "password", message: "비밀번호는 필수 항목입니다." },
  4108: { field: "generation", message: "기수는 필수 항목입니다." },
  4109: { field: "activeStatus", message: "활동 상태는 필수 항목입니다." },
  4009: { field: "id", message: "이미 존재하는 계정입니다." },
  3001: { field: "activeStatus", message: null },
};

/**
 * @public
 * @description 에러 코드를 필드 에러로 변환합니다
 * @param code - 서버 에러 코드
 * @param serverMessage - 서버 응답 메시지 (3001 에러 시 사용)
 * @returns 필드 이름과 에러 메시지, 또는 null
 */
export const getFieldErrorFromCode = (
  code: number,
  serverMessage: string
): { field: FieldName; message: string } | null => {
  const mapped = ERROR_CODE_MAP[code];
  if (!mapped) return null;

  const message = mapped.message ?? serverMessage;
  return { field: mapped.field, message };
};
