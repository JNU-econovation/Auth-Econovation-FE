import { NavLink, Outlet } from "react-router";
import { ScreenWrapper, Spacing, Text } from "@auth-econovation/ui";
import { useMockRole } from "@/lib/mockRole";
import { isMockEnabled } from "@/lib/mockActor";
import RoleSwitcher from "@/components/RoleSwitcher";

const NAV_ITEMS = [
  { to: "/clients", label: "클라이언트" },
  { to: "/members", label: "회원 역할" },
];

/**
 * ADMIN 미만(USER) 요청자에게 표시하는 접근 거부 안내.
 *
 * ⚠️ 현재 가드는 개발(MSW) 역할 전환기 상태를 근거로 동작합니다. 프로덕션에서는 세션 쿠키
 * 기반 권한 검증(예: 어드민 세션 확인 후 미인증 시 SSO 로그인으로 리다이렉트)으로 대체해야 합니다.
 */
const AccessDenied = () => (
  <div className="rounded-lg border border-input-border-gray bg-input-bg-gray p-6">
    <Text size="4" color="error">
      접근 권한이 없습니다
    </Text>
    <Spacing size={8} />
    <Text size="6" color="gray1">
      어드민 콘솔은 ADMIN 이상 권한이 필요합니다. 관리자에게 권한을 요청하세요.
    </Text>
  </div>
);

/**
 * 콘솔 공통 레이아웃: 헤더(타이틀 + DEV 역할 전환기) · 네비게이션 · 권한 가드.
 * 중첩 라우트는 `<Outlet />`로 렌더링합니다.
 */
const AdminLayout = () => {
  const { role } = useMockRole();
  // 이 가드는 개발(MSW) 역할 전환 시연용 UX 힌트일 뿐, 실제 보안 경계가 아닙니다.
  // 진짜 권한 강제는 어드민 API 호출에 대한 서버의 401/403 응답입니다. 따라서 프로덕션
  // (MSW 미사용)에서는 콘텐츠를 항상 렌더하고, 인증 통합 시 세션 기반 가드로 대체합니다.
  const denyForMockRole =
    isMockEnabled() && role !== "ADMIN" && role !== "SUPER_ADMIN";

  return (
    <ScreenWrapper>
      <Spacing size={32} />
      <header className="flex items-center justify-between">
        <Text size="2">Econovation 어드민 콘솔</Text>
        {isMockEnabled() && <RoleSwitcher />}
      </header>
      <Spacing size={20} />
      <nav className="flex gap-6 border-b border-input-border-gray pb-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {({ isActive }) => (
              <Text size="6" color={isActive ? "primary" : "gray1"}>
                {item.label}
              </Text>
            )}
          </NavLink>
        ))}
      </nav>
      <Spacing size={24} />
      {denyForMockRole ? <AccessDenied /> : <Outlet />}
      <Spacing size={48} />
    </ScreenWrapper>
  );
};

export default AdminLayout;
