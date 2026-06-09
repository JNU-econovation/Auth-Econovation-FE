import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import ClientRegisterSection from "./index";

/**
 * 클라이언트 등록 핵심 흐름 통합 테스트.
 * 공유 MSW 어드민 핸들러(@auth-econovation/api/mocks)에 대해 실제 요청으로 검증합니다.
 */
describe("ClientRegisterSection (통합)", () => {
  it("이름과 redirect URI로 등록하면 발급된 clientId를 보여준다", async () => {
    const { user } = renderWithProviders(<ClientRegisterSection />);

    await user.type(
      screen.getByLabelText("클라이언트 이름"),
      "NEW CONSOLE APP",
    );
    await user.type(
      screen.getByLabelText("redirect URI"),
      "https://new.econo.com/callback",
    );
    await user.click(screen.getByRole("button", { name: "클라이언트 등록" }));

    await waitFor(() => {
      expect(screen.getByText("발급된 clientId")).toBeInTheDocument();
    });
    // 모킹이 발급하는 결정적 clientId 형태(c1ient00-...) 노출 확인
    expect(screen.getByText(/c1ient00-/)).toBeInTheDocument();
  });

  it("clientName이 중복이면 서버 에러 메시지(409)를 보여준다", async () => {
    const { user } = renderWithProviders(<ClientRegisterSection />);

    await user.type(screen.getByLabelText("클라이언트 이름"), "ECONO SPA"); // seed 중복
    await user.type(
      screen.getByLabelText("redirect URI"),
      "https://x.econo.com/cb",
    );
    await user.click(screen.getByRole("button", { name: "클라이언트 등록" }));

    await waitFor(() => {
      expect(
        screen.getByText("이미 사용 중인 clientName입니다."),
      ).toBeInTheDocument();
    });
  });

  it("필수 입력이 비면 클라이언트 측 검증 메시지를 보여준다", async () => {
    const { user } = renderWithProviders(<ClientRegisterSection />);

    await user.type(screen.getByLabelText("클라이언트 이름"), "ONLY NAME");
    await user.click(screen.getByRole("button", { name: "클라이언트 등록" }));

    expect(
      screen.getByText("redirect URI를 입력해주세요."),
    ).toBeInTheDocument();
  });
});
