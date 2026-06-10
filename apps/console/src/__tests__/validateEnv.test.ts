import { describe, it, expect } from "vitest";
import { parseBoolEnv, requireEnv } from "@/lib/validateEnv";

/**
 * 환경변수 검증 규칙 단위 테스트(unit 프로젝트, node 환경).
 * `import.meta.env` 평가와 무관한 순수 함수만 다루므로 Vite 런타임 없이 검증합니다.
 */
describe("requireEnv", () => {
  it("값이 있으면 그대로 반환한다", () => {
    expect(requireEnv("https://api.example.com", "VITE_API_URL")).toBe(
      "https://api.example.com",
    );
  });

  it("undefined면 변수명을 포함한 에러로 실패한다", () => {
    expect(() => requireEnv(undefined, "VITE_API_URL")).toThrowError(
      "[env] VITE_API_URL is not defined",
    );
  });

  it("빈 문자열이면 실패한다", () => {
    expect(() => requireEnv("", "VITE_API_URL")).toThrow();
  });

  it("공백뿐이면 실패한다", () => {
    expect(() => requireEnv("   ", "VITE_API_URL")).toThrow();
  });
});

describe("parseBoolEnv", () => {
  it('정확히 "true"일 때만 true', () => {
    expect(parseBoolEnv("true")).toBe(true);
  });

  it.each(["false", "1", "TRUE", "", undefined])(
    "%s는 false로 파싱한다",
    (value) => {
      expect(parseBoolEnv(value)).toBe(false);
    },
  );
});
