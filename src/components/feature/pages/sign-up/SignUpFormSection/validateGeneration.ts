const INTEGER_REGEX = /^-?\d+$/;
const MIN_GENERATION = 1;
const MAX_GENERATION = 99;

export function validateGeneration(value: string): string {
  if (value === "") {
    return "";
  }

  if (!INTEGER_REGEX.test(value)) {
    return "기수는 정수만 입력할 수 있습니다.";
  }

  const num = Number(value);
  if (num < MIN_GENERATION || num > MAX_GENERATION) {
    return "기수는 1에서 99 사이여야 합니다.";
  }

  return "";
}
