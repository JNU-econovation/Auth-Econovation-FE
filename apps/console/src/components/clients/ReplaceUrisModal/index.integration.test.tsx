import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import ReplaceUrisModal from "./index";

/**
 * redirect URI 전체 교체 모달의 diff 계산·파괴적 경고 통합 테스트.
 * 공유 MSW 어드민 핸들러(seed clientId)에 실제 PUT 요청으로 검증합니다.
 */
const SEED_CLIENT_ID = "a1b2c3d4-1234-5678-9abc-def012345678";
const URI_PLACEHOLDER = "https://app.example.com/oauth/callback";

describe("ReplaceUrisModal (통합)", () => {
  it("URI를 추가하면 diff에 추가 항목을 보여주고 교체 성공 시 onReplaced를 호출한다", async () => {
    const onReplaced = vi.fn();
    const { user } = renderWithProviders(
      <ReplaceUrisModal
        clientId={SEED_CLIENT_ID}
        current={["https://app.econo.com/callback"]}
        onClose={() => {}}
        onReplaced={onReplaced}
      />,
    );

    await user.click(screen.getByRole("button", { name: "+ URI 추가" }));
    const inputs = screen.getAllByPlaceholderText(URI_PLACEHOLDER);
    await user.type(inputs[1], "https://new.econo.com/callback");

    await user.click(screen.getByRole("button", { name: "변경 내용 확인" }));

    // diff 단계: 추가 항목 노출
    expect(
      screen.getByText("https://new.econo.com/callback"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "전체 교체" }));
    await waitFor(() => expect(onReplaced).toHaveBeenCalledTimes(1));
  });

  it("기존 URI를 제거하면 파괴적 변경 경고를 보여준다", async () => {
    const { user } = renderWithProviders(
      <ReplaceUrisModal
        clientId={SEED_CLIENT_ID}
        current={["https://a.econo.com/cb", "https://b.econo.com/cb"]}
        onClose={() => {}}
        onReplaced={() => {}}
      />,
    );

    // 두 번째 행 삭제 → b 제거(파괴적)
    const removeButtons = screen.getAllByRole("button", { name: "행 삭제" });
    await user.click(removeButtons[1]);

    await user.click(screen.getByRole("button", { name: "변경 내용 확인" }));

    expect(
      screen.getByText("1개 URI가 즉시 차단됩니다."),
    ).toBeInTheDocument();
  });
});
