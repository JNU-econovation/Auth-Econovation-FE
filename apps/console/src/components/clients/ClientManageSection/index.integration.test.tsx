import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import ClientManageSection from "./index";

/**
 * 클라이언트 조회 + redirect URI 관리(추가/삭제) 핵심 흐름 통합 테스트.
 * 공유 MSW 어드민 핸들러(@auth-econovation/api/mocks)에 대해 실제 요청으로 검증합니다.
 */
describe("ClientManageSection (통합)", () => {
  // seed 클라이언트(ECONO SPA, redirectUris=["https://app.econo.com/callback"])
  const SEED_CLIENT = "a1b2c3d4-1234-5678-9abc-def012345678";
  const SEED_URI = "https://app.econo.com/callback";

  const lookup = async (user: ReturnType<typeof renderWithProviders>["user"]) => {
    await user.type(screen.getByLabelText("clientId로 조회"), SEED_CLIENT);
    await user.click(screen.getByRole("button", { name: "조회" }));
    await waitFor(() => expect(screen.getByText("ECONO SPA")).toBeInTheDocument());
  };

  it("clientId로 조회하면 클라이언트 이름과 redirect URI를 보여준다", async () => {
    const { user } = renderWithProviders(<ClientManageSection />);
    await lookup(user);
    expect(screen.getByText(SEED_URI)).toBeInTheDocument();
  });

  it("redirect URI를 추가하면 목록에 반영된다", async () => {
    const { user } = renderWithProviders(<ClientManageSection />);
    await lookup(user);

    await user.type(
      screen.getByLabelText("redirect URI 추가"),
      "https://added.econo.com/cb",
    );
    await user.click(screen.getByRole("button", { name: "URI 추가" }));

    await waitFor(() => {
      expect(
        screen.getByText("https://added.econo.com/cb"),
      ).toBeInTheDocument();
    });
    // 기존 URI도 유지
    expect(screen.getByText(SEED_URI)).toBeInTheDocument();
  });

  it("redirect URI를 삭제하면 목록에서 사라진다", async () => {
    const { user } = renderWithProviders(<ClientManageSection />);
    await lookup(user);

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(screen.queryByText(SEED_URI)).not.toBeInTheDocument();
    });
  });

  it("존재하지 않는 clientId면 에러 메시지(404)를 보여준다", async () => {
    const { user } = renderWithProviders(<ClientManageSection />);
    await user.type(screen.getByLabelText("clientId로 조회"), "no-such-client");
    await user.click(screen.getByRole("button", { name: "조회" }));

    await waitFor(() => {
      expect(screen.getByText("존재하지 않는 리소스입니다.")).toBeInTheDocument();
    });
  });
});
