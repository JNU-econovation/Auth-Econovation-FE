import { NavLink, Outlet } from "react-router";
import { ScreenWrapper, Spacing, Text } from "@auth-econovation/ui";

const NAV_ITEMS = [{ to: "/clients", label: "클라이언트" }];

/**
 * 콘솔 공통 레이아웃: 헤더(타이틀) · 네비게이션. 중첩 라우트는 `<Outlet />`로 렌더링합니다.
 *
 * ⚠️ 권한 가드는 어드민 API 호출에 대한 서버의 401/403 응답으로 강제됩니다. 인증 통합 시
 * 세션 기반 가드(미인증 시 SSO 로그인 리다이렉트 등)를 이 레이아웃에 추가합니다.
 */
const AdminLayout = () => {
  return (
    <ScreenWrapper>
      <Spacing size={32} />
      <header className="flex items-center justify-between">
        <Text size="2">Econovation 어드민 콘솔</Text>
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
      <Outlet />
      <Spacing size={48} />
    </ScreenWrapper>
  );
};

export default AdminLayout;
