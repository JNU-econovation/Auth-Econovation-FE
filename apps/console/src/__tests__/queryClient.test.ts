import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logout", () => ({ logout: vi.fn() }));
vi.mock("@/lib/authStatus", () => ({ markUnauthenticated: vi.fn() }));

const makeAxiosError = (status?: number): AxiosError => {
  const error = new AxiosError("test error");
  error.response = { status } as AxiosError["response"];
  return error;
};

describe("handleAuthFailure", () => {
  let handleAuthFailure: (error: unknown) => void;
  let logout: ReturnType<typeof vi.fn>;
  let markUnauthenticated: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // 모듈 레벨 로그아웃 가드를 테스트마다 초기화하기 위해 모듈을 새로 로드한다.
    vi.resetModules();
    ({ logout } = (await import("@/lib/logout")) as never);
    ({ markUnauthenticated } = (await import("@/lib/authStatus")) as never);
    ({ handleAuthFailure } = await import("@/lib/queryClient"));
    // mock은 resetModules로 초기화되지 않으므로 호출 기록을 따로 비운다.
    vi.clearAllMocks();
  });

  it("401이면 markUnauthenticated만 호출한다", () => {
    handleAuthFailure(makeAxiosError(401));

    expect(markUnauthenticated).toHaveBeenCalledTimes(1);
    expect(logout).not.toHaveBeenCalled();
  });

  it("403이면 즉시 logout을 호출한다", () => {
    handleAuthFailure(makeAxiosError(403));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(markUnauthenticated).not.toHaveBeenCalled();
  });

  it("403이 여러 번 들어와도 logout은 한 번만 호출한다", () => {
    handleAuthFailure(makeAxiosError(403));
    handleAuthFailure(makeAxiosError(403));
    handleAuthFailure(makeAxiosError(403));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("axios 에러가 아니면 아무것도 하지 않는다", () => {
    handleAuthFailure(new Error("boom"));

    expect(logout).not.toHaveBeenCalled();
    expect(markUnauthenticated).not.toHaveBeenCalled();
  });

  it("그 외 4xx(400/404/409)는 인증 실패로 처리하지 않는다", () => {
    for (const status of [400, 404, 409]) {
      handleAuthFailure(makeAxiosError(status));
    }

    expect(logout).not.toHaveBeenCalled();
    expect(markUnauthenticated).not.toHaveBeenCalled();
  });
});
