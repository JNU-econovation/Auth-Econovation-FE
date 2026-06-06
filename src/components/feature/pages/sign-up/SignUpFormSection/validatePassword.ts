const ASCII_PRINTABLE_REGEX = /^[\x21-\x7E]*$/;
const LETTER_REGEX = /[a-zA-Z]/;
const DIGIT_REGEX = /[0-9]/;
const SPECIAL_REGEX = /[!-/:-@[-`{-~]/;
// 명세(`context/sso-api/frontend-auth.md`): 비밀번호 8~19자.
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 19;

export function validatePassword(value: string): string {
  if (value === "") {
    return "";
  }
  if (!ASCII_PRINTABLE_REGEX.test(value)) {
    return "비밀번호는 영문, 숫자, 특수문자만 입력할 수 있습니다.";
  }
  if (value.length < MIN_PASSWORD_LENGTH || value.length > MAX_PASSWORD_LENGTH) {
    return "비밀번호는 8~19자여야 합니다.";
  }
  if (!LETTER_REGEX.test(value) || !DIGIT_REGEX.test(value) || !SPECIAL_REGEX.test(value)) {
    return "비밀번호는 영문, 숫자, 특수기호를 각각 1개 이상 포함해야 합니다.";
  }
  return "";
}
