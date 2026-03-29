import { describe, it, expect } from "vitest";

const normalizeBaseURL = (url: string) => (url ?? "").replace(/\/+$/, "");

describe("normalizeBaseURL", () => {
  it("트레일링 슬래시 하나를 제거한다", () => {
    expect(normalizeBaseURL("http://example.com/")).toBe("http://example.com");
  });

  it("트레일링 슬래시 여러 개를 제거한다", () => {
    expect(normalizeBaseURL("http://example.com///")).toBe(
      "http://example.com",
    );
  });

  it("트레일링 슬래시가 없으면 그대로 반환한다", () => {
    expect(normalizeBaseURL("http://example.com")).toBe("http://example.com");
  });

  it("빈 문자열은 빈 문자열을 반환한다", () => {
    expect(normalizeBaseURL("")).toBe("");
  });

  it("경로가 포함된 URL의 트레일링 슬래시를 제거한다", () => {
    expect(normalizeBaseURL("http://example.com/api/v1/")).toBe(
      "http://example.com/api/v1",
    );
  });

  it("슬래시만 있는 경우 빈 문자열을 반환한다", () => {
    expect(normalizeBaseURL("/")).toBe("");
  });
});
