const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]*$/;
const MIN_ID_LENGTH = 3;
const MAX_ID_LENGTH = 20;

export function validateId(value: string): string {
  if (value === "") {
    return "";
  }

  if (!ALPHANUMERIC_REGEX.test(value)) {
    return "아이디는 영문과 숫자만 입력할 수 있습니다.";
  }

  if (value.length < MIN_ID_LENGTH) {
    return "아이디는 3자 이상이어야 합니다.";
  }

  if (value.length >= MAX_ID_LENGTH) {
    return "아이디는 20자 미만이어야 합니다.";
  }

  return "";
}
