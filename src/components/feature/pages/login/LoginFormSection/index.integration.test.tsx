import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import { server } from "@/test/mocks/server";
import { SIGN_IN_API_PATH } from "@/api/auth/v1/login";
import {
  LOGIN_INVALID_CREDENTIALS,
  LOGIN_SUCCESS_RESPONSE,
} from "@/test/mocks/handlers";
import LoginFormSection from "./index";

/**
 * LoginFormSection 통합 테스트.
 *
 * 폼 입력 → useSignIn 뮤테이션 → MSW로 모킹된 `POST /api/v1/auth/login` 응답까지의
 * 실제 데이터 흐름을 검증합니다. 단위 테스트와 달리 컴포넌트·React Query·axios·네트워크
 * 계층(MSW)을 모두 통과시키는 점이 통합 테스트의 핵심입니다.
 */

const REDIRECT_URL = "https://app.econovation.kr/callback";

describe("LoginFormSection 통합 테스트", () => {
  beforeEach(() => {
    // 성공 흐름의 리다이렉트(window.location.href 할당)를 가로채 검증 가능하게 만듭니다.
    // jsdom은 실제 내비게이션을 수행하지 않지만, 할당 자체는 추적할 수 있도록 mock으로 대체합니다.
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, href: "http://localhost/" },
    });
  });

  it("아이디를 비우고 제출하면 검증 에러를 보여주고 API를 호출하지 않는다", async () => {
    const requestSpy = vi.fn();
    server.use(
      http.post(`*${SIGN_IN_API_PATH}`, () => {
        requestSpy();
        return HttpResponse.json(LOGIN_SUCCESS_RESPONSE);
      }),
    );

    const { user } = renderWithProviders(<LoginFormSection />, {
      route: `/?redirect-url=${encodeURIComponent(REDIRECT_URL)}`,
    });

    await user.click(screen.getByRole("button", { name: "로그인 하기" }));

    expect(
      await screen.findByText("아이디를 입력해주세요."),
    ).toBeInTheDocument();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("정상 로그인 시 모킹된 API로 자격 증명을 전송하고 redirect-url로 이동한다", async () => {
    let receivedBody: unknown;
    let receivedClientType: string | null = null;
    server.use(
      http.post(`*${SIGN_IN_API_PATH}`, async ({ request }) => {
        receivedBody = await request.json();
        receivedClientType = request.headers.get("Client-Type");
        return HttpResponse.json(LOGIN_SUCCESS_RESPONSE);
      }),
    );

    const { user } = renderWithProviders(<LoginFormSection />, {
      route: `/?redirect-url=${encodeURIComponent(REDIRECT_URL)}`,
    });

    await user.type(
      screen.getByPlaceholderText("아이디를 입력해주세요."),
      "hong123",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 입력해주세요."),
      "Econo1234!",
    );
    await user.click(screen.getByRole("button", { name: "로그인 하기" }));

    // MSW가 받은 요청 바디/헤더가 폼 입력과 일치하는지 검증
    await waitFor(() => {
      expect(receivedBody).toEqual({
        loginId: "hong123",
        password: "Econo1234!",
      });
    });
    expect(receivedClientType).toBe("WEB");

    // 성공 응답 후 redirect-url로 만료 시각 쿼리를 붙여 이동
    await waitFor(() => {
      expect(window.location.href).toBe(
        `${REDIRECT_URL}?accessExpiredTime=${LOGIN_SUCCESS_RESPONSE.accessExpiredTime}`,
      );
    });
  });

  it("서버가 에러 코드를 반환하면 매핑된 에러 메시지를 노출한다", async () => {
    server.use(
      http.post(`*${SIGN_IN_API_PATH}`, () => {
        return HttpResponse.json(LOGIN_INVALID_CREDENTIALS, { status: 401 });
      }),
    );

    const { user } = renderWithProviders(<LoginFormSection />, {
      route: `/?redirect-url=${encodeURIComponent(REDIRECT_URL)}`,
    });

    await user.type(
      screen.getByPlaceholderText("아이디를 입력해주세요."),
      "hong123",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 입력해주세요."),
      "wrong-password",
    );
    await user.click(screen.getByRole("button", { name: "로그인 하기" }));

    // 에러 코드 매핑 메시지(또는 서버 메시지)가 화면에 표시되고, 리다이렉트는 일어나지 않는다.
    expect(
      await screen.findByText(LOGIN_INVALID_CREDENTIALS.message),
    ).toBeInTheDocument();
    expect(window.location.href).toBe("http://localhost/");
  });
});
