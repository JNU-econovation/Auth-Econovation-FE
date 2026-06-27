import { describe, it, expect, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { apiClient, setAuthTokenGetter } from "./client";
import { server } from "./mocks/server";

/**
 * 공유 `apiClient`의 Authorization 헤더 주입 계약 테스트(node + MSW).
 *
 * 게터를 주입한 앱(console)만 매 요청에 `Authorization: Bearer <AT>`가 붙고, 미주입(web)이면
 * 붙지 않아 기존 쿠키 인증이 유지됨을 실제 요청 파이프라인을 통과시켜 검증합니다.
 */
describe("apiClient Authorization 주입", () => {
  afterEach(() => {
    setAuthTokenGetter(null);
  });

  /** 임시 핸들러로 요청의 Authorization 헤더를 가로채 반환합니다. */
  const captureAuthHeader = async (): Promise<string | null> => {
    let received: string | null = null;
    server.use(
      http.get("*/__auth_probe", ({ request }) => {
        received = request.headers.get("Authorization");
        return HttpResponse.json({ ok: true });
      }),
    );
    await apiClient.get("http://localhost/__auth_probe");
    return received;
  };

  it("게터 미주입(web)이면 Authorization 헤더가 없다", async () => {
    expect(await captureAuthHeader()).toBeNull();
  });

  it("게터가 토큰을 반환하면(console) Bearer로 주입한다", async () => {
    setAuthTokenGetter(() => "at-123");
    expect(await captureAuthHeader()).toBe("Bearer at-123");
  });

  it("게터가 빈 값을 반환하면 헤더를 붙이지 않는다", async () => {
    setAuthTokenGetter(() => null);
    expect(await captureAuthHeader()).toBeNull();
  });
});

/**
 * 공유 `apiClient`의 `Client-Type` 헤더 분기 계약 테스트(node + MSW).
 *
 * web(게터 미주입)은 기본 헤더 `Client-Type: WEB`를 그대로 싣고, console(게터 주입)은
 * 토큰 기반이라 해당 헤더를 싣지 않음을 실제 요청 파이프라인으로 검증합니다.
 */
describe("apiClient Client-Type 헤더", () => {
  afterEach(() => {
    setAuthTokenGetter(null);
  });

  /** 임시 핸들러로 요청의 Client-Type 헤더를 가로채 반환합니다. */
  const captureClientTypeHeader = async (): Promise<string | null> => {
    let received: string | null = null;
    server.use(
      http.get("*/__client_type_probe", ({ request }) => {
        received = request.headers.get("Client-Type");
        return HttpResponse.json({ ok: true });
      }),
    );
    await apiClient.get("http://localhost/__client_type_probe");
    return received;
  };

  it("게터 미주입(web)이면 Client-Type: WEB 헤더를 싣는다", async () => {
    expect(await captureClientTypeHeader()).toBe("WEB");
  });

  it("게터가 토큰을 반환하면(console) Client-Type 헤더를 싣지 않는다", async () => {
    setAuthTokenGetter(() => "at-123");
    expect(await captureClientTypeHeader()).toBeNull();
  });

  it("게터가 빈 값을 반환해도(console) Client-Type 헤더를 싣지 않는다", async () => {
    setAuthTokenGetter(() => null);
    expect(await captureClientTypeHeader()).toBeNull();
  });
});
