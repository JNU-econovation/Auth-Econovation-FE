import { describe, it, expect } from "vitest";
import { extractRedirectTokens } from "@/lib/redirectTokens";

/**
 * APP 리다이렉트 토큰 추출 단위 테스트(unit 프로젝트, node 환경).
 * `window`·localStorage 의존이 없는 순수 함수만 다룹니다(저장·URL 정리는 부수효과라 제외).
 */
describe("extractRedirectTokens", () => {
  it("accessToken이 없으면(=APP 리다이렉트 아님) null을 반환한다", () => {
    expect(extractRedirectTokens("")).toBeNull();
    expect(extractRedirectTokens("?foo=bar")).toBeNull();
  });

  it("accessToken/refreshToken/accessExpiredTime을 모두 추출한다", () => {
    const result = extractRedirectTokens(
      "?accessToken=at-123&refreshToken=rt-456&accessExpiredTime=1900000000000",
    );

    expect(result).toEqual({
      accessToken: "at-123",
      refreshToken: "rt-456",
      accessExpiredTime: 1_900_000_000_000,
    });
  });

  it("accessToken만 있으면 나머지는 undefined로 둔다", () => {
    expect(extractRedirectTokens("?accessToken=at-123")).toEqual({
      accessToken: "at-123",
      refreshToken: undefined,
      accessExpiredTime: undefined,
    });
  });

  it("accessExpiredTime이 숫자가 아니거나 비어 있으면 undefined로 무시한다", () => {
    expect(
      extractRedirectTokens("?accessToken=at-123&accessExpiredTime=not-a-number")
        ?.accessExpiredTime,
    ).toBeUndefined();
    expect(
      extractRedirectTokens("?accessToken=at-123&accessExpiredTime=")
        ?.accessExpiredTime,
    ).toBeUndefined();
  });

  it("`?` 없는 쿼리 문자열도 파싱한다", () => {
    expect(extractRedirectTokens("accessToken=at-123")?.accessToken).toBe(
      "at-123",
    );
  });
});
