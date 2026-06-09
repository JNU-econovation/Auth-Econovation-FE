export function validatePasswordConfirm(
  value: string,
  password: string,
): string {
  if (value === "") {
    return "";
  }

  if (value !== password) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return "";
}
