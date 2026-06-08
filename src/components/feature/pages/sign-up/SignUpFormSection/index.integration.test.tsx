import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { Routes, Route, useLocation } from "react-router";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import { server } from "@/test/mocks/server";
import { SIGN_UP_API_PATH } from "@/api/auth/v1/signup";
import { MOCK_ACCESS_EXPIRED_TIME } from "@/test/mocks/constants";
import { errorResponse } from "@/test/mocks/errors";
import LoginFormSection from "../../login/LoginFormSection";
import SignUpFormSection from "./index";

/**
 * SignUpFormSection 통합 테스트.
 *
 * 폼 입력 → 클라이언트 검증(validateAllFields) → useSignUp 뮤테이션 →
 * MSW로 모킹된 `POST /api/v1/auth/signup` → 성공 시 로그인 페이지 이동까지의
 * 실제 데이터 흐름을 검증합니다. handlers.integration.test.ts가 "가짜 백엔드"를
 * fetch로 직접 검증하는 것과 달리, 여기서는 컴포넌트·React Query·axios·MSW를
 * 모두 통과시키는 **유저 플로우**를 검증합니다.
 */

const REDIRECT_URL = "https://app.econovation.kr/callback";

/** 모든 필드가 유효한 기본 입력값(MSW signup 핸들러의 통과 조건과 일치). */
const VALID_INPUT = {
  name: "신규유저",
  id: "newuser01",
  password: "Econo1234!",
  passwordConfirm: "Econo1234!",
  generation: "33",
  status: "AM",
};

/** 현재 라우터 위치(pathname+search)를 노출해 navigate 결과를 검증 가능하게 하는 프로브. */
function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

/** 회원가입 폼의 모든 필드를 채웁니다. overrides로 일부 값만 바꿀 수 있습니다. */
const fillSignUpForm = async (
  user: ReturnType<typeof renderWithProviders>["user"],
  overrides: Partial<typeof VALID_INPUT> = {},
) => {
  const v = { ...VALID_INPUT, ...overrides };
  await user.type(screen.getByPlaceholderText("이름을 입력해주세요."), v.name);
  await user.type(screen.getByPlaceholderText("아이디를 입력해주세요."), v.id);
  await user.type(
    screen.getByPlaceholderText("비밀번호를 입력해주세요."),
    v.password,
  );
  await user.type(
    screen.getByPlaceholderText("비밀번호를 다시 입력해주세요."),
    v.passwordConfirm,
  );
  await user.type(
    screen.getByPlaceholderText("기수를 입력해주세요 (1-99)"),
    v.generation,
  );
  await user.selectOptions(screen.getByLabelText("활동 상태"), v.status);
};

describe("SignUpFormSection 통합 테스트", () => {
  it("필수 필드를 비우고 제출하면 검증 에러를 보여주고 API를 호출하지 않는다", async () => {
    const requestSpy = vi.fn();
    server.use(
      http.post(`*${SIGN_UP_API_PATH}`, () => {
        requestSpy();
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const { user } = renderWithProviders(<SignUpFormSection />, {
      route: "/sign-in",
    });

    await user.click(screen.getByRole("button", { name: "회원가입 하기" }));

    expect(await screen.findByText("이름을 입력해주세요.")).toBeInTheDocument();
    expect(screen.getByText("아이디를 입력해주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해주세요.")).toBeInTheDocument();
    // "활동 상태를 선택해주세요."는 Select의 첫 option 텍스트와 동일하므로 에러 <p>로 특정한다.
    expect(
      screen.getByText("활동 상태를 선택해주세요.", { selector: "p" }),
    ).toBeInTheDocument();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("비밀번호 확인이 불일치하면 검증 에러를 보여주고 API를 호출하지 않는다", async () => {
    const requestSpy = vi.fn();
    server.use(
      http.post(`*${SIGN_UP_API_PATH}`, () => {
        requestSpy();
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const { user } = renderWithProviders(<SignUpFormSection />, {
      route: "/sign-in",
    });

    await fillSignUpForm(user, { passwordConfirm: "Different1!" });
    await user.click(screen.getByRole("button", { name: "회원가입 하기" }));

    expect(
      await screen.findByText("비밀번호가 일치하지 않습니다."),
    ).toBeInTheDocument();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it("정상 입력 시 모킹된 API로 가입 바디를 전송하고 로그인 페이지로 이동한다(쿼리 보존)", async () => {
    let receivedBody: unknown;
    let receivedUrl = "";
    server.use(
      http.post(`*${SIGN_UP_API_PATH}`, async ({ request }) => {
        receivedBody = await request.json();
        receivedUrl = request.url;
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const { user } = renderWithProviders(
      <Routes>
        <Route path="/sign-in" element={<SignUpFormSection />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: `/sign-in?redirect-url=${encodeURIComponent(REDIRECT_URL)}` },
    );

    await fillSignUpForm(user);
    await user.click(screen.getByRole("button", { name: "회원가입 하기" }));

    // 폼 입력이 명세 스키마(generation은 number)로 변환되어 전송되는지 검증
    await waitFor(() => {
      expect(receivedBody).toEqual({
        name: VALID_INPUT.name,
        loginId: VALID_INPUT.id,
        password: VALID_INPUT.password,
        generation: 33,
        status: VALID_INPUT.status,
      });
    });
    // code 파라미터가 없으면 쿼리로 붙지 않는다
    expect(new URL(receivedUrl).searchParams.has("code")).toBe(false);

    // 가입 성공 후 로그인 페이지("/")로 이동하며 SSO 쿼리(redirect-url)를 보존한다
    await waitFor(() => {
      const location = screen.getByTestId("location").textContent ?? "";
      expect(location.startsWith("/?")).toBe(true);
      const search = new URLSearchParams(location.slice(location.indexOf("?")));
      expect(search.get("redirect-url")).toBe(REDIRECT_URL);
    });
  });

  it("SSO code 파라미터가 있으면 가입 요청에 전달하고 이동 시에도 보존한다", async () => {
    let receivedCode: string | null = null;
    server.use(
      http.post(`*${SIGN_UP_API_PATH}`, ({ request }) => {
        receivedCode = new URL(request.url).searchParams.get("code");
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const { user } = renderWithProviders(
      <Routes>
        <Route path="/sign-in" element={<SignUpFormSection />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      {
        route: `/sign-in?redirect-url=${encodeURIComponent(REDIRECT_URL)}&code=sso-code-123`,
      },
    );

    await fillSignUpForm(user);
    await user.click(screen.getByRole("button", { name: "회원가입 하기" }));

    await waitFor(() => expect(receivedCode).toBe("sso-code-123"));
    await waitFor(() => {
      const location = screen.getByTestId("location").textContent ?? "";
      const search = new URLSearchParams(location.slice(location.indexOf("?")));
      expect(search.get("code")).toBe("sso-code-123");
    });
  });

  it("loginId가 중복(MEMBER_ALREADY_EXISTS)이면 id 필드 에러를 노출하고 이동하지 않는다", async () => {
    // server.use 없이 stateful db의 기본 핸들러를 사용: seed에 존재하는 loginId로 가입 시도.
    const { user } = renderWithProviders(
      <Routes>
        <Route path="/sign-in" element={<SignUpFormSection />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: "/sign-in" },
    );

    await fillSignUpForm(user, { id: "honggildong" });
    await user.click(screen.getByRole("button", { name: "회원가입 하기" }));

    expect(
      await screen.findByText("이미 사용 중인 아이디입니다."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  it("특정 필드로 매핑되지 않는 서버 에러는 alert로 폴백하고 이동하지 않는다", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    server.use(
      http.post(`*${SIGN_UP_API_PATH}`, () =>
        errorResponse("VALIDATION_FAILED"),
      ),
    );

    const { user } = renderWithProviders(
      <Routes>
        <Route path="/sign-in" element={<SignUpFormSection />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { route: "/sign-in" },
    );

    await fillSignUpForm(user);
    await user.click(screen.getByRole("button", { name: "회원가입 하기" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("요청 값이 올바르지 않습니다."),
    );
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();

    alertSpy.mockRestore();
  });
});

describe("회원가입 → 로그인 연속 여정 (stateful MSW)", () => {
  beforeEach(() => {
    // 로그인 성공 시 발생하는 window.location.href 할당을 가로채 검증 가능하게 만듭니다.
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, href: "http://localhost/" },
    });
  });

  it("가입한 계정으로 곧바로 로그인하면 redirect-url로 이동한다", async () => {
    // override 없이 stateful db의 기본 핸들러를 사용 → 가입한 계정이 실제로 db에 적재되어
    // 동일 자격으로 로그인이 성공하는 "진짜 연속 여정"을 검증합니다.
    const { user } = renderWithProviders(
      <Routes>
        <Route path="/sign-in" element={<SignUpFormSection />} />
        <Route path="/" element={<LoginFormSection />} />
      </Routes>,
      { route: `/sign-in?redirect-url=${encodeURIComponent(REDIRECT_URL)}` },
    );

    // 1) 회원가입
    await fillSignUpForm(user);
    await user.click(screen.getByRole("button", { name: "회원가입 하기" }));

    // 2) 가입 성공 후 로그인 폼으로 이동(같은 라우터, redirect-url 보존)
    const loginButton = await screen.findByRole("button", {
      name: "로그인 하기",
    });

    // 3) 방금 가입한 자격으로 로그인
    await user.type(
      screen.getByPlaceholderText("아이디를 입력해주세요."),
      VALID_INPUT.id,
    );
    await user.type(
      screen.getByPlaceholderText("비밀번호를 입력해주세요."),
      VALID_INPUT.password,
    );
    await user.click(loginButton);

    // 4) WEB 로그인 성공 → redirect-url로 이동(토큰은 쿠키이므로 만료 시각만 쿼리에 부착)
    await waitFor(() => {
      expect(window.location.href).toBe(
        `${REDIRECT_URL}?accessExpiredTime=${MOCK_ACCESS_EXPIRED_TIME}`,
      );
    });
  });
});
