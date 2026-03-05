const ASCII_PRINTABLE_REGEX = /^[\x21-\x7E]*$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

export function validatePassword(value: string): string {
  if (value === "") {
    return "";
  }
  if (!ASCII_PRINTABLE_REGEX.test(value)) {
    return "비밀번호는 영문, 숫자, 특수문자만 입력할 수 있습니다.";
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return "비밀번호는 8자 이상이어야 합니다.";
  }
  if (value.length >= MAX_PASSWORD_LENGTH) {
    return "비밀번호는 20자 미만이어야 합니다.";
  }
  return "";
}
