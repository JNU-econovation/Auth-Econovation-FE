import { NavLink, Outlet } from "react-router";
import { Button, GridIcon, LogoMark } from "@auth-econovation/ui";

const NAV_ITEMS = [
  { to: "/clients", label: "클라이언트", icon: GridIcon },
] as const;

/**
 * 콘솔 셸 레이아웃: 좌측 고정 사이드바(로고·네비·사용자) + 우측 콘텐츠 영역.
 * 중첩 라우트는 `<Outlet />`으로 렌더링합니다.
 *
 * ⚠️ 사용자 영역(이름·역할)은 me 엔드포인트 제거로 현재 비어 있습니다.
 *    사용자 정보 조회 수단이 확정되면 이 영역을 다시 채웁니다.
 * ⚠️ 로그아웃은 SSO 로그아웃 흐름이 아직 미확정이라 임시 비활성 상태입니다.
 */
const ConsoleLayout = () => {
  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <aside className="sticky top-0 flex h-screen flex-col border-r border-border bg-white px-4 py-6">
        {/* 로고 */}
        <div className="flex items-center gap-2.5 px-3 pt-2 pb-6">
          <LogoMark />
          <span className="text-sm leading-tight font-bold tracking-[-0.01em]">
            SSO 콘솔
            <small className="block text-[11px] font-normal tracking-normal text-ink-soft">
              Econovation
            </small>
          </span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex w-full items-center gap-2 rounded-lg px-3 py-[9px] text-left text-sm font-medium transition",
                  isActive
                    ? "bg-accent-weak text-accent"
                    : "text-ink-soft hover:bg-bg-sunken hover:text-ink",
                ].join(" ")
              }
            >
              <Icon className="h-[15px] w-[15px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* 사용자 영역 — me 엔드포인트 제거로 현재 비어 있음(사용자 정보 연동 재도입 시 채움) */}
        <div className="border-t border-border px-3 pt-4 pb-1">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost-plain"
              size="sm"
              disabled
              title="로그아웃 연동 후 제공됩니다"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ConsoleLayout;
