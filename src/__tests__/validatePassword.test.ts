import { describe, it, expect } from "vitest";
import { validatePassword } from "@pages/sign-up/SignUpFormSection/validatePassword";

describe("validatePassword", () => {
  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(validatePassword("")).toBe("");
  });

  it("영문+숫자+특수문자 8자 이상 19자 이하는 빈 문자열을 반환한다", () => {
    expect(validatePassword("Abc123!@")).toBe("");
    expect(validatePassword("myPass99#")).toBe("");
  });

  it("경계값: 정확히 8자는 빈 문자열을 반환한다", () => {
    expect(validatePassword("abcd1234")).toBe("");
  });

  it("경계값: 정확히 19자는 빈 문자열을 반환한다", () => {
    expect(validatePassword("abcdefghijk12345678")).toBe("");
  });

  it("영문만 8자는 빈 문자열을 반환한다", () => {
    expect(validatePassword("abcdefgh")).toBe("");
  });

  it("숫자만 8자는 빈 문자열을 반환한다", () => {
    expect(validatePassword("12345678")).toBe("");
  });

  it("특수문자만 8자는 빈 문자열을 반환한다", () => {
    expect(validatePassword("!@#$%^&*")).toBe("");
  });

  it("한글이 포함된 경우 문자 종류 에러를 반환한다", () => {
    expect(validatePassword("abcd한글ef")).toBe(
      "비밀번호는 영문, 숫자, 특수문자만 입력할 수 있습니다.",
    );
  });

  it("공백이 포함된 경우 문자 종류 에러를 반환한다", () => {
    expect(validatePassword("abcd efgh")).toBe(
      "비밀번호는 영문, 숫자, 특수문자만 입력할 수 있습니다.",
    );
  });

  it("7자 이하는 최소 길이 에러를 반환한다", () => {
    expect(validatePassword("abc1234")).toBe(
      "비밀번호는 8자 이상이어야 합니다.",
    );
  });

  it("경계값: 정확히 20자는 최대 길이 에러를 반환한다", () => {
    expect(validatePassword("abcdefghijk123456789")).toBe(
      "비밀번호는 20자 미만이어야 합니다.",
    );
  });
});
