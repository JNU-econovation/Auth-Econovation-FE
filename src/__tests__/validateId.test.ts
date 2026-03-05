import { describe, it, expect } from "vitest";
import { validateId } from "@pages/sign-up/SignUpFormSection/validateId";

describe("validateId", () => {
  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(validateId("")).toBe("");
  });

  it("영문 3자 이상 19자 이하의 유효한 아이디는 빈 문자열을 반환한다", () => {
    expect(validateId("testuser")).toBe("");
  });

  it("영문만으로 구성된 아이디는 빈 문자열을 반환한다", () => {
    expect(validateId("abcdef")).toBe("");
  });

  it("숫자만으로 구성된 아이디는 빈 문자열을 반환한다", () => {
    expect(validateId("12345")).toBe("");
  });

  it("경계값: 정확히 3자는 빈 문자열을 반환한다", () => {
    expect(validateId("abc")).toBe("");
  });

  it("경계값: 정확히 19자는 빈 문자열을 반환한다", () => {
    expect(validateId("a".repeat(19))).toBe("");
  });

  it("한글이 포함된 경우 문자 종류 에러를 반환한다", () => {
    expect(validateId("테스트")).toBe(
      "아이디는 영문과 숫자만 입력할 수 있습니다.",
    );
  });

  it("특수문자가 포함된 경우 문자 종류 에러를 반환한다", () => {
    expect(validateId("test!@#")).toBe(
      "아이디는 영문과 숫자만 입력할 수 있습니다.",
    );
  });

  it("공백이 포함된 경우 문자 종류 에러를 반환한다", () => {
    expect(validateId("test user")).toBe(
      "아이디는 영문과 숫자만 입력할 수 있습니다.",
    );
  });

  it("2자 이하는 길이 에러를 반환한다", () => {
    expect(validateId("ab")).toBe("아이디는 3자 이상이어야 합니다.");
  });

  it("경계값: 정확히 20자는 길이 에러를 반환한다", () => {
    expect(validateId("a".repeat(20))).toBe(
      "아이디는 20자 미만이어야 합니다.",
    );
  });
});
