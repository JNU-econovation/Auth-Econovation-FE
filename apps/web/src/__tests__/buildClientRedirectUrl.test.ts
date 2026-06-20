import { describe, it, expect } from "vitest";
import { buildClientRedirectUrl } from "@/lib/buildClientRedirectUrl";

/**
 * APP 로그인 성공 시 redirectUrl에 토큰을 쿼리로 첨부하는 순수 로직 단위 테스트.
 *
 * WEB은 토큰을 HttpOnly 쿠키로 받으므로 응답 바디에 토큰이 없고(첨부 안 함),
 * APP은 응답 바디의 accessToken/refreshToken을 redirectUrl(앱 콜백/커스텀 스킴)에
 * 쿼리로 실어 보내 네이티브 앱이 가로채 수신하도록 합니다.
 * (`redirectToClient`이 이 결과를 window.location.assign으로 이동시킵니다.)
 */
describe("buildClientRedirectUrl", () => {
  const REDIRECT = "https://app.econo.com/callback";

  it("토큰이 없으면(WEB) redirectUrl을 그대로 반환한다", () => {
    expect(buildClientRedirectUrl(REDIRECT)).toBe(REDIRECT);
    expect(buildClientRedirectUrl(REDIRECT, {})).toBe(REDIRECT);
  });

  it("APP 토큰이 있으면 accessToken/refreshToken/accessExpiredTime을 쿼리로 첨부한다", () => {
    const result = buildClientRedirectUrl(REDIRECT, {
      accessToken: "at-123",
      refreshToken: "rt-456",
      accessExpiredTime: 1_900_000_000_000,
    });
    const url = new URL(result);
    expect(url.searchParams.get("accessToken")).toBe("at-123");
    expect(url.searchParams.get("refreshToken")).toBe("rt-456");
    expect(url.searchParams.get("accessExpiredTime")).toBe("1900000000000");
    // 기존 오리진/경로는 보존
    expect(url.origin + url.pathname).toBe(REDIRECT);
  });

  it("토큰 없이 accessExpiredTime만 있으면(WEB) 아무것도 첨부하지 않는다", () => {
    // accessExpiredTime은 WEB 응답 바디에도 있으므로, 첨부 트리거는 토큰 존재 여부로 판단한다.
    expect(
      buildClientRedirectUrl(REDIRECT, { accessExpiredTime: 1_900_000_000_000 }),
    ).toBe(REDIRECT);
  });

  it("커스텀 스킴(econoapp://) redirectUrl에도 토큰을 첨부한다", () => {
    const result = buildClientRedirectUrl("econoapp://callback", {
      accessToken: "at-123",
      refreshToken: "rt-456",
    });
    expect(result).toBe(
      "econoapp://callback?accessToken=at-123&refreshToken=rt-456",
    );
  });

  it("일부 토큰만 있으면 있는 것만 첨부한다", () => {
    const result = buildClientRedirectUrl(REDIRECT, { accessToken: "at-123" });
    const url = new URL(result);
    expect(url.searchParams.get("accessToken")).toBe("at-123");
    expect(url.searchParams.has("refreshToken")).toBe(false);
  });

  it("redirectUrl에 기존 쿼리가 있으면 보존하며 토큰을 추가한다", () => {
    const result = buildClientRedirectUrl(
      "https://app.econo.com/callback?foo=bar",
      { accessToken: "at-123" },
    );
    const url = new URL(result);
    expect(url.searchParams.get("foo")).toBe("bar");
    expect(url.searchParams.get("accessToken")).toBe("at-123");
  });

  it("절대 URL이 아니어서 파싱이 불가하면 원본을 그대로 반환한다", () => {
    // new URL이 throw하는 상대경로 등은 원본 유지(방어적 폴백)
    expect(buildClientRedirectUrl("/callback", { accessToken: "at-123" })).toBe(
      "/callback",
    );
  });
});
