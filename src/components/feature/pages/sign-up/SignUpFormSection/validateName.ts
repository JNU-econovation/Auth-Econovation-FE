// 명세(`context/sso-api/frontend-auth.md`): 이름 1~50자. 문자셋 제한 없음.
const MAX_NAME_LENGTH = 50;

export function validateName(value: string): string {
  if (value.length > MAX_NAME_LENGTH) {
    return "이름은 최대 50자까지 입력할 수 있습니다.";
  }
  return "";
}
