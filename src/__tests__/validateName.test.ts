import { describe, it, expect } from "vitest";
import { validateName } from "@pages/sign-up/SignUpFormSection/validateName";

describe("validateName", () => {
  it("정상적인 한글 이름은 빈 문자열을 반환한다", () => {
    expect(validateName("홍길동")).toBe("");
  });

  it("5자 한글 이름(경계값)은 빈 문자열을 반환한다", () => {
    expect(validateName("홍길동동동")).toBe("");
  });

  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(validateName("")).toBe("");
  });

  it("자음 단독 입력은 허용된다 (정규식 범위 포함)", () => {
    expect(validateName("ㄱㄴㄷ")).toBe("");
  });

  it("모음 단독 입력은 허용된다 (정규식 범위 포함)", () => {
    expect(validateName("ㅏㅑㅓ")).toBe("");
  });

  it("영문이 포함된 경우 한글만 입력 가능 에러를 반환한다", () => {
    expect(validateName("hong")).toBe("이름은 한글만 입력할 수 있습니다.");
  });

  it("숫자가 포함된 경우 한글만 입력 가능 에러를 반환한다", () => {
    expect(validateName("123")).toBe("이름은 한글만 입력할 수 있습니다.");
  });

  it("특수문자가 포함된 경우 한글만 입력 가능 에러를 반환한다", () => {
    expect(validateName("홍!동")).toBe("이름은 한글만 입력할 수 있습니다.");
  });

  it("6자 이상의 한글 이름은 최대 5자 에러를 반환한다", () => {
    expect(validateName("홍길동동동동")).toBe(
      "이름은 최대 5자까지 입력할 수 있습니다.",
    );
  });
});
