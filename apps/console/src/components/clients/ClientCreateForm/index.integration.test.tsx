import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import ClientCreateForm from "./index";

/**
 * 클라이언트 등록 폼 핵심 흐름 통합 테스트.
 * 공유 MSW 어드민 핸들러(@auth-econovation/api/mocks)에 실제 요청으로 검증합니다.
 */
describe("ClientCreateForm (통합)", () => {
  const typeName = (user: ReturnType<typeof renderWithProviders>["user"], v: string) =>
    user.type(screen.getByLabelText(/클라이언트 이름/), v);
  const typeFirstUri = (
    user: ReturnType<typeof renderWithProviders>["user"],
    v: string,
  ) =>
    user.type(
      screen.getByPlaceholderText("https://app.example.com/oauth/callback"),
      v,
    );

  it("이름과 redirect URI로 등록하면 발급된 clientId 모달을 보여준다", async () => {
    const { user } = renderWithProviders(<ClientCreateForm />);

    await typeName(user, "NEW CONSOLE APP");
    await typeFirstUri(user, "https://new.econo.com/callback");
    await user.click(screen.getByRole("button", { name: "클라이언트 등록" }));

    await waitFor(() => {
      expect(
        screen.getByText("클라이언트가 등록되었습니다"),
      ).toBeInTheDocument();
    });
    // 모킹이 발급하는 결정적 clientId 형태(c1ient00-...) 노출 확인
    expect(screen.getByText(/c1ient00-/)).toBeInTheDocument();
  });

  it("이름이 중복이면 이름 필드 에러를 보여준다(409 DUPLICATE_RESOURCE)", async () => {
    const { user } = renderWithProviders(<ClientCreateForm />);

    await typeName(user, "ECONO SPA"); // seed 중복
    await typeFirstUri(user, "https://x.econo.com/cb");
    await user.click(screen.getByRole("button", { name: "클라이언트 등록" }));

    await waitFor(() => {
      expect(
        screen.getByText("이미 사용 중인 이름입니다. 다른 이름을 입력하세요."),
      ).toBeInTheDocument();
    });
  });

  it("이름이 비면 클라이언트 측 검증 메시지를 보여준다", async () => {
    const { user } = renderWithProviders(<ClientCreateForm />);

    await typeFirstUri(user, "https://only-uri.econo.com/cb");
    await user.click(screen.getByRole("button", { name: "클라이언트 등록" }));

    expect(
      screen.getByText("클라이언트 이름을 입력하세요."),
    ).toBeInTheDocument();
  });
});
