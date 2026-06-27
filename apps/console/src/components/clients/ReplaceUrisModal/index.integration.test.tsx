import { describe, it, expect, vi } from "vitest";
import { postClientApi } from "@auth-econovation/api/clients";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import ReplaceUrisModal from "./index";

/**
 * redirect URI 전체 교체 모달의 diff 계산·파괴적 경고 통합 테스트.
 *
 * 셀프 클라이언트 수정(`PUT /api/v1/clients/{clientId}`)은 본인 소유 클라이언트만 대상이므로,
 * seed(어드민 소유)가 아닌 셀프 등록 클라이언트를 먼저 만든 뒤 그 clientId로 검증합니다.
 */
const URI_PLACEHOLDER = "https://app.example.com/oauth/callback";

describe("ReplaceUrisModal (통합)", () => {
  it("URI를 추가하면 diff에 추가 항목을 보여주고 교체 성공 시 onReplaced를 호출한다", async () => {
    const created = await postClientApi({
      clientName: "교체 테스트 SPA",
      redirectUris: ["https://app.econo.com/callback"],
    });

    const onReplaced = vi.fn();
    const { user } = renderWithProviders(
      <ReplaceUrisModal
        clientId={created.clientId}
        clientName="교체 테스트 SPA"
        current={["https://app.econo.com/callback"]}
        route={null}
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
    // diff 미리보기까지만 진행하므로 실제 PUT 요청은 발생하지 않습니다.
    const { user } = renderWithProviders(
      <ReplaceUrisModal
        clientId="c1ient00-0000-4000-8000-000000000099"
        clientName="파괴적 변경 SPA"
        current={["https://a.econo.com/cb", "https://b.econo.com/cb"]}
        route={null}
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
