import { describe, it, expect } from "vitest";
import { validatePassword } from "@pages/sign-up/SignUpFormSection/validatePassword";

describe("validatePassword", () => {
  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(validatePassword("")).toBe("");
  });

  it("영문+숫자+특수기호 유효 비밀번호는 빈 문자열을 반환한다", () => {
    expect(validatePassword("Abc123!@")).toBe("");
    expect(validatePassword("myPass99#")).toBe("");
  });

  it("경계값: 정확히 8자(영문+숫자+특수기호 포함)는 빈 문자열을 반환한다", () => {
    expect(validatePassword("Abc123!@")).toBe("");
  });

  it("경계값: 정확히 19자(영문+숫자+특수기호 포함)는 빈 문자열을 반환한다", () => {
    expect(validatePassword("Abcdef1234567890!@#")).toBe("");
  });

  it("경계값: 정확히 20자(영문+숫자+특수기호 포함)는 빈 문자열을 반환한다", () => {
    expect(validatePassword("Abcdef12345678901!@")).toBe("");
  });

  it("21자는 최대 길이 에러를 반환한다", () => {
    expect(validatePassword("Abcdef1234567890123!@")).toBe(
      "비밀번호는 8~20자여야 합니다.",
    );
  });

  it("영문만 8자는 조합 에러를 반환한다", () => {
    expect(validatePassword("abcdefgh")).toBe(
      "비밀번호는 영문, 숫자, 특수기호를 각각 1개 이상 포함해야 합니다.",
    );
  });

  it("숫자만 8자는 조합 에러를 반환한다", () => {
    expect(validatePassword("12345678")).toBe(
      "비밀번호는 영문, 숫자, 특수기호를 각각 1개 이상 포함해야 합니다.",
    );
  });

  it("특수기호만 8자는 조합 에러를 반환한다", () => {
    expect(validatePassword("!@#$%^&*")).toBe(
      "비밀번호는 영문, 숫자, 특수기호를 각각 1개 이상 포함해야 합니다.",
    );
  });

  it("영문+숫자만(특수기호 없음)은 조합 에러를 반환한다", () => {
    expect(validatePassword("Abcdef12")).toBe(
      "비밀번호는 영문, 숫자, 특수기호를 각각 1개 이상 포함해야 합니다.",
    );
  });

  it("영문+특수기호만(숫자 없음)은 조합 에러를 반환한다", () => {
    expect(validatePassword("Abcdef!@")).toBe(
      "비밀번호는 영문, 숫자, 특수기호를 각각 1개 이상 포함해야 합니다.",
    );
  });

  it("숫자+특수기호만(영문 없음)은 조합 에러를 반환한다", () => {
    expect(validatePassword("12345!@#")).toBe(
      "비밀번호는 영문, 숫자, 특수기호를 각각 1개 이상 포함해야 합니다.",
    );
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

  it("7자 이하는 길이 에러를 반환한다", () => {
    expect(validatePassword("Abc123!")).toBe(
      "비밀번호는 8~20자여야 합니다.",
    );
  });
});
