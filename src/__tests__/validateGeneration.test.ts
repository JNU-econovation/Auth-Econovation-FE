import { describe, it, expect } from "vitest";
import { validateGeneration } from "@pages/sign-up/SignUpFormSection/validateGeneration";

describe("validateGeneration", () => {
  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(validateGeneration("")).toBe("");
  });

  it("하한 경계값 1은 빈 문자열을 반환한다", () => {
    expect(validateGeneration("1")).toBe("");
  });

  it("상한 경계값 99는 빈 문자열을 반환한다", () => {
    expect(validateGeneration("99")).toBe("");
  });

  it("정상 범위 50은 빈 문자열을 반환한다", () => {
    expect(validateGeneration("50")).toBe("");
  });

  it("0은 범위 에러를 반환한다", () => {
    expect(validateGeneration("0")).toBe("기수는 1에서 99 사이여야 합니다.");
  });

  it("100은 범위 에러를 반환한다", () => {
    expect(validateGeneration("100")).toBe("기수는 1에서 99 사이여야 합니다.");
  });

  it("-1은 범위 에러를 반환한다", () => {
    expect(validateGeneration("-1")).toBe("기수는 1에서 99 사이여야 합니다.");
  });

  it("소수 1.5는 정수 형식 에러를 반환한다", () => {
    expect(validateGeneration("1.5")).toBe(
      "기수는 정수만 입력할 수 있습니다.",
    );
  });

  it("문자 abc는 정수 형식 에러를 반환한다", () => {
    expect(validateGeneration("abc")).toBe(
      "기수는 정수만 입력할 수 있습니다.",
    );
  });

  it("혼합 12a는 정수 형식 에러를 반환한다", () => {
    expect(validateGeneration("12a")).toBe(
      "기수는 정수만 입력할 수 있습니다.",
    );
  });
});
