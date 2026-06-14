import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import { server } from "@auth-econovation/api/mocks/server";
import { SIGN_IN_API_PATH } from "@auth-econovation/api";
import {
  MOCK_ACCESS_EXPIRED_TIME,
  LOGIN_INVALID_CREDENTIALS,
} from "@auth-econovation/api/mocks";
import LoginFormSection from "./index";

/** WEB 로그인 성공 응답(만료 시각만, 토큰은 쿠키로 발급). */
const WEB_LOGIN_SUCCESS = { accessExpiredTime: MOCK_ACCESS_EXPIRED_TIME };

/**
 * LoginFormSection 통합 테스트.
 *
 * 폼 입력 → useSignIn 뮤테이션 → MSW로 모킹된 `POST /api/v1/auth/login` 응답까지의
 * 실제 데이터 흐름을 검증합니다. 단위 테스트와 달리 컴포넌트·React Query·axios·네트워크
 * 계층(MSW)을 모두 통과시키는 점이 통합 테스트의 핵심입니다.
 *
 * 로그인 성공 후 리다이렉트는 더 이상 프론트가 수행하지 않으므로(백엔드/SSO 흐름이 담당),
 * 프론트의 책임은 "올바른 자격 증명(clientId 포함)·Client-Type을 전송"하는 것과
 * "실패 시 에러를 노출"하는 것입니다.
 */

const CLIENT_ID = "a1b2c3d4-1234-5678-9abc-def012345678";

describe("LoginFormSection 통합 테스트", () => {
  it("아이디를 비우고 제출하면 검증 에러를 보여주고 API를 호출하지 않는다", async () => {
    const requestSpy = vi.fn();
    server.use(
      http.post(`*${SIGN_IN_API_PATH}`, () => {
        requestSpy();
        return HttpResponse.json(WEB_LOGIN_SUCCESS);
      }),
    );

    const { user } = renderWithProviders(<LoginFormSection />, { route: "/" });

    await user.click(screen.getByRole("button", { name: "로그인 하기" }));

    expect(
      await screen.findByText("아이디를 입력해주세요."),
    ).toBeInTheDocument();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("정상 로그인 시 모킹된 API로 자격 증명(clientId 포함)과 Client-Type=WEB을 전송한다", async () => {
    let receivedBody: unknown;
    let receivedClientType: string | null = null;
    server.use(
      http.post(`*${SIGN_IN_API_PATH}`, async ({ request }) => {
        receivedBody = await request.json();
        receivedClientType = request.headers.get("Client-Type");
        return HttpResponse.json(WEB_LOGIN_SUCCESS);
      }),
    );

    const { user } = renderWithProviders(<LoginFormSection />, {
      route: `/?client-id=${CLIENT_ID}`,
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

    // MSW가 받은 요청 바디/헤더가 폼 입력 + client-id 쿼리와 일치하는지 검증
    await waitFor(() => {
      expect(receivedBody).toEqual({
        loginId: "hong123",
        password: "Econo1234!",
        clientId: CLIENT_ID,
      });
    });
    expect(receivedClientType).toBe("WEB");
  });

  it("client-type=APP이면 Client-Type=APP 헤더로 자격 증명을 전송한다", async () => {
    let receivedBody: unknown;
    let receivedClientType: string | null = null;
    server.use(
      http.post(`*${SIGN_IN_API_PATH}`, async ({ request }) => {
        receivedBody = await request.json();
        receivedClientType = request.headers.get("Client-Type");
        return HttpResponse.json(WEB_LOGIN_SUCCESS);
      }),
    );

    const { user } = renderWithProviders(<LoginFormSection />, {
      route: `/?client-id=${CLIENT_ID}&client-type=APP`,
    });

    await user.type(
      screen.getByPlaceholderText("아이디를 입력해주세요."),
      "honggildong",
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 입력해주세요."),
      "Econo1234!",
    );
    await user.click(screen.getByRole("button", { name: "로그인 하기" }));

    await waitFor(() => {
      expect(receivedClientType).toBe("APP");
    });
    expect(receivedBody).toEqual({
      loginId: "honggildong",
      password: "Econo1234!",
      clientId: CLIENT_ID,
    });
  });

  it("서버가 에러 코드를 반환하면 매핑된 에러 메시지를 노출한다", async () => {
    server.use(
      http.post(`*${SIGN_IN_API_PATH}`, () => {
        return HttpResponse.json(LOGIN_INVALID_CREDENTIALS, { status: 401 });
      }),
    );

    const { user } = renderWithProviders(<LoginFormSection />, {
      route: `/?client-id=${CLIENT_ID}`,
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

    // 에러 코드 매핑 메시지(또는 서버 메시지)가 화면에 표시된다.
    expect(
      await screen.findByText(LOGIN_INVALID_CREDENTIALS.message),
    ).toBeInTheDocument();
  });
});
