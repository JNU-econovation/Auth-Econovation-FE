import { describe, it, expect } from "vitest";
import {
  resolveDevLoginParams,
  type DevLoginDefaults,
} from "@/hooks/useDevLoginParams/resolveDevLoginParams";

/**
 * 개발용 로그인 쿼리 보정 순수 함수 단위 테스트.
 * (`useDevLoginParams`가 이 규칙으로 '/' 진입 시 누락 쿼리를 채워 리다이렉트합니다.)
 */

const DEFAULTS: DevLoginDefaults = {
  isDev: true,
  clientId: "dev-client-id",
  clientType: "web",
};

const result = (search: string, defaults: DevLoginDefaults = DEFAULTS) =>
  resolveDevLoginParams(new URLSearchParams(search), defaults);

describe("resolveDevLoginParams", () => {
  it("dev 모드에서 쿼리가 비어 있으면 모든 기본값으로 채운다", () => {
    const next = result("");
    expect(next).not.toBeNull();
    expect(next?.get("client-id")).toBe("dev-client-id");
    expect(next?.get("client-type")).toBe("web");
  });

  it("운영 빌드(isDev=false)에서는 보정하지 않는다(null)", () => {
    expect(result("", { ...DEFAULTS, isDev: false })).toBeNull();
  });

  it("이미 모든 키가 채워져 있으면 보정하지 않는다(null)", () => {
    expect(result("client-id=x&client-type=app")).toBeNull();
  });

  it("일부만 누락되면 누락된 키만 채우고 기존 값은 보존한다", () => {
    const next = result("client-type=app");
    expect(next?.get("client-type")).toBe("app"); // 기존 값 보존
    expect(next?.get("client-id")).toBe("dev-client-id"); // 누락 키만 채움
  });

  it("기본값이 빈 키는 건너뛴다(무한 리다이렉트 방지)", () => {
    // client-id 기본값이 비어 있고 그 키만 누락 → 채울 게 없으므로 null
    const next = result("client-type=web", {
      ...DEFAULTS,
      clientId: "",
    });
    expect(next).toBeNull();
  });
});
