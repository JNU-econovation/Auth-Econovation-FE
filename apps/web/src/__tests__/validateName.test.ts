import { describe, it, expect } from "vitest";
import { validateName } from "@pages/sign-up/SignUpFormSection/validateName";

/**
 * 이름 검증 단위 테스트.
 * 명세(`context/sso-api/frontend-auth.md`): 이름 1~50자, 문자셋 제한 없음.
 */
describe("validateName", () => {
  const LENGTH_ERROR = "이름은 최대 50자까지 입력할 수 있습니다.";

  it("정상적인 한글 이름은 빈 문자열을 반환한다", () => {
    expect(validateName("홍길동")).toBe("");
  });

  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(validateName("")).toBe("");
  });

  it("영문 이름도 허용된다 (문자셋 제한 없음)", () => {
    expect(validateName("hong")).toBe("");
  });

  it("숫자/특수문자가 포함된 이름도 허용된다 (문자셋 제한 없음)", () => {
    expect(validateName("John Doe 3세")).toBe("");
  });

  it("경계값: 정확히 50자는 빈 문자열을 반환한다", () => {
    expect(validateName("가".repeat(50))).toBe("");
  });

  it("51자 이상은 최대 50자 에러를 반환한다", () => {
    expect(validateName("가".repeat(51))).toBe(LENGTH_ERROR);
  });
});
