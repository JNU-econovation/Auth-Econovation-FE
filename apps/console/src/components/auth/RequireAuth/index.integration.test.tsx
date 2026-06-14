import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { Routes, Route } from "react-router";
import { server } from "@auth-econovation/api/mocks/server";
import { ME_API_PATH } from "@auth-econovation/api";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import { redirectToLogin } from "@/lib/redirectToLogin";
import RequireAuth from "./index";

/**
 * 인증 가드 핵심 분기 통합 테스트.
 * - 인증됨(me 200, 폴백 SUPER_ADMIN): 보호 라우트 통과
 * - 미인증(me 401): 재로그인 안내 + 로그인 버튼 → SSO 리다이렉트
 *
 * 로그인 리다이렉트는 전체 페이지 이동이라 jsdom에서 직접 검증이 까다로우므로
 * `redirectToLogin`을 목으로 대체해 호출 여부만 확인합니다.
 */
vi.mock("@/lib/redirectToLogin", () => ({ redirectToLogin: vi.fn() }));

const renderGuard = () =>
  renderWithProviders(
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<div>보호된 콘텐츠</div>} />
      </Route>
    </Routes>,
  );

describe("RequireAuth (통합)", () => {
  it("인증되면 보호된 자식 라우트를 렌더한다", async () => {
    renderGuard();

    await waitFor(() => {
      expect(screen.getByText("보호된 콘텐츠")).toBeInTheDocument();
    });
  });

  it("미인증(401)이면 재로그인 안내를 표시한다", async () => {
    server.use(
      http.get(`*${ME_API_PATH}`, () =>
        HttpResponse.json(
          {
            errorCode: "INVALID_CREDENTIALS",
            message: "인증이 필요합니다.",
            timestamp: "2026-06-14T00:00:00",
          },
          { status: 401 },
        ),
      ),
    );

    renderGuard();

    await waitFor(() => {
      expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument();
    });
    expect(screen.queryByText("보호된 콘텐츠")).not.toBeInTheDocument();
  });

  it("미인증 화면의 로그인 버튼을 누르면 SSO 로그인으로 리다이렉트한다", async () => {
    server.use(
      http.get(`*${ME_API_PATH}`, () =>
        HttpResponse.json(
          {
            errorCode: "INVALID_CREDENTIALS",
            message: "인증이 필요합니다.",
            timestamp: "2026-06-14T00:00:00",
          },
          { status: 401 },
        ),
      ),
    );

    const { user } = renderGuard();

    const loginButton = await screen.findByRole("button", { name: "로그인" });
    await user.click(loginButton);

    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it("인증됐지만 USER 역할이면 접근 권한 안내를 표시한다(콘솔 접근 불가)", async () => {
    server.use(
      http.get(`*${ME_API_PATH}`, () =>
        HttpResponse.json({
          memberId: 5,
          name: "회원5",
          loginId: "member5",
          generation: 30,
          status: "AM",
          role: "USER",
        }),
      ),
    );

    renderGuard();

    await waitFor(() => {
      expect(screen.getByText("접근 권한이 없습니다")).toBeInTheDocument();
    });
    expect(screen.queryByText("보호된 콘텐츠")).not.toBeInTheDocument();
  });

  it("네트워크/5xx 오류는 세션 만료가 아닌 재시도 안내로 구분한다", async () => {
    server.use(
      http.get(`*${ME_API_PATH}`, () => HttpResponse.error()),
    );

    renderGuard();

    // 네트워크 실패는 1회 재시도(backoff)를 거치므로 타임아웃을 넉넉히 둡니다.
    await waitFor(
      () => {
        expect(
          screen.getByText("콘솔을 불러오지 못했습니다"),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    // 네트워크 오류는 재로그인 화면으로 흡수되지 않아야 한다.
    expect(screen.queryByText("로그인이 필요합니다")).not.toBeInTheDocument();
  });
});
