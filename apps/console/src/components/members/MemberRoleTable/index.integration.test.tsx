import { describe, it, expect } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/utils";
import { setMockActorRole } from "@/lib/mockActor";
import MemberRoleTable from "./index";

/**
 * 회원 역할 관리 핵심 흐름 통합 테스트.
 * 역할 가드(SUPER_ADMIN 전용 변경, ADMIN 403)를 X-Mock-Role 헤더로 시뮬레이션합니다.
 */
describe("MemberRoleTable (통합)", () => {
  it("회원 목록을 페이지네이션으로 보여준다(전체 23명)", async () => {
    renderWithProviders(<MemberRoleTable />);

    await waitFor(() => {
      expect(screen.getByText(/전체 23명/)).toBeInTheDocument();
    });
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("김에코")).toBeInTheDocument();
  });

  it("SUPER_ADMIN은 회원 역할을 변경할 수 있다", async () => {
    const { user } = renderWithProviders(<MemberRoleTable />);
    await waitFor(() => expect(screen.getByText("김에코")).toBeInTheDocument());

    const select = screen.getByLabelText("김에코 역할") as HTMLSelectElement;
    expect(select.value).toBe("ADMIN");

    await user.selectOptions(select, "USER");

    await waitFor(() => {
      expect(
        (screen.getByLabelText("김에코 역할") as HTMLSelectElement).value,
      ).toBe("USER");
    });
  });

  it("ADMIN 권한이면 역할 변경 시 403 에러 메시지를 보여준다", async () => {
    setMockActorRole("ADMIN");
    const { user } = renderWithProviders(<MemberRoleTable />);
    await waitFor(() => expect(screen.getByText("회원3")).toBeInTheDocument());

    const select = screen.getByLabelText("회원3 역할") as HTMLSelectElement;
    await user.selectOptions(select, "ADMIN");

    await waitFor(() => {
      expect(
        screen.getByText("관리자 권한이 필요합니다."),
      ).toBeInTheDocument();
    });
  });
});
