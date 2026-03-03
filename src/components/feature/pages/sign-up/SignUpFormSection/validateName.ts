const KOREAN_REGEX = /^[가-힣ㄱ-ㅎㅏ-ㅣ]*$/;
const MAX_NAME_LENGTH = 5;

export function validateName(value: string): string {
  if (value.length > 0 && !KOREAN_REGEX.test(value)) {
    return "이름은 한글만 입력할 수 있습니다.";
  }
  if (value.length > MAX_NAME_LENGTH) {
    return "이름은 최대 5자까지 입력할 수 있습니다.";
  }
  return "";
}
