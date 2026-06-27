import { describe, it, expect } from "vitest";
import { buildLoginUrl } from "@/lib/buildLoginUrl";

/**
 * SSO 로그인 페이지 URL 조립 순수 로직 단위 테스트(unit 프로젝트, node 환경).
 *
 * 미인증 시 콘솔은 로그인 페이지(web)로 전체 리다이렉트하며, 페이지가 읽는
 * client-type/client-id(kebab-case)와 복귀 경로 returnTo를 쿼리로 붙입니다.
 * 실제 이동(window.location.assign)은 `redirectToLogin`이 담당하므로 여기선 조립만 검증합니다.
 */
describe("buildLoginUrl", () => {
  const LOGIN_URL = "https://auth-econovation-fe.vercel.app/";
  const QUERY = {
    clientType: "app",
    clientId: "da18f4c6-2fa6-45bf-86ce-2e9b93500bc2",
    returnTo: "http://localhost:5173/clients",
  } as const;

  it("client-type/client-id/returnTo를 쿼리로 첨부하고 오리진·경로는 보존한다", () => {
    const url = new URL(buildLoginUrl(LOGIN_URL, QUERY));

    expect(url.origin + url.pathname).toBe(LOGIN_URL);
    expect(url.searchParams.get("client-type")).toBe("app");
    expect(url.searchParams.get("client-id")).toBe(QUERY.clientId);
    expect(url.searchParams.get("returnTo")).toBe(QUERY.returnTo);
  });

  it("로그인 페이지(web)가 읽는 키는 kebab-case다(camelCase로 새지 않는다)", () => {
    const url = new URL(buildLoginUrl(LOGIN_URL, QUERY));

    expect(url.searchParams.has("clientType")).toBe(false);
    expect(url.searchParams.has("clientId")).toBe(false);
  });

  it("loginUrl에 같은 키가 이미 있으면 인자 값으로 덮어쓴다", () => {
    // 예: 배포 환경변수의 base에 client-type=WEB이 박혀 있어도 app으로 교체된다.
    const result = buildLoginUrl(
      "https://auth-econovation-fe.vercel.app/?client-type=WEB&client-id=old",
      QUERY,
    );
    const url = new URL(result);

    expect(url.searchParams.getAll("client-type")).toEqual(["app"]);
    expect(url.searchParams.getAll("client-id")).toEqual([QUERY.clientId]);
  });

  it("loginUrl의 다른 기존 쿼리는 보존한다", () => {
    const result = buildLoginUrl(
      "https://auth-econovation-fe.vercel.app/?foo=bar",
      QUERY,
    );
    const url = new URL(result);

    expect(url.searchParams.get("foo")).toBe("bar");
    expect(url.searchParams.get("client-type")).toBe("app");
  });

  it("returnTo의 특수문자는 URL 인코딩되어 첨부되고 원래 값으로 복원된다", () => {
    const returnTo = "http://localhost:5173/clients?tab=active&sort=name";
    const result = buildLoginUrl(LOGIN_URL, { ...QUERY, returnTo });

    // 직렬화된 문자열에는 인코딩되어 들어가고(=, & 가 raw로 새지 않음)
    expect(result).toContain(encodeURIComponent(returnTo));
    // 파싱하면 원래 값으로 복원된다.
    expect(new URL(result).searchParams.get("returnTo")).toBe(returnTo);
  });

  it("절대 URL이 아니어서 파싱이 불가하면 원본을 그대로 반환한다", () => {
    // new URL이 throw하는 상대경로 등은 원본 유지(방어적 폴백)
    expect(buildLoginUrl("/login", QUERY)).toBe("/login");
  });
});
