import { describe, it, expect } from "vitest";
import { validatePasswordConfirm } from "@pages/sign-up/SignUpFormSection/validatePasswordConfirm";

describe("validatePasswordConfirm", () => {
  it("확인란 미입력 시 빈 문자열을 반환한다", () => {
    expect(validatePasswordConfirm("", "Password1!")).toBe("");
  });

  it("비밀번호가 일치하면 빈 문자열을 반환한다", () => {
    expect(validatePasswordConfirm("Password1!", "Password1!")).toBe("");
  });

  it("비밀번호가 불일치하면 에러 메시지를 반환한다", () => {
    expect(validatePasswordConfirm("Password1!", "Password2!")).toBe(
      "비밀번호가 일치하지 않습니다.",
    );
  });

  it("둘 다 빈 문자열이면 빈 문자열을 반환한다", () => {
    expect(validatePasswordConfirm("", "")).toBe("");
  });

  it("대소문자가 다르면 에러 메시지를 반환한다", () => {
    expect(validatePasswordConfirm("password", "Password")).toBe(
      "비밀번호가 일치하지 않습니다.",
    );
  });
});
