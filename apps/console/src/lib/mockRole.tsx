import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AdminRole } from "@auth-econovation/api/admin";
import { getMockActorRole, setMockActorRole } from "./mockActor";

/**
 * 개발(MSW) 전용 actor 역할 React Context.
 *
 * 모듈 store(`./mockActor`)와 동기화되어, 역할 전환 UI(RoleSwitcher)에서 바꾼 역할이
 * axios 인터셉터에 즉시 반영됩니다.
 */

interface MockRoleContextValue {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
}

const MockRoleContext = createContext<MockRoleContextValue | null>(null);

/**
 * @public
 * @description actor 역할 상태를 제공합니다. 모듈 store와 동기화되어 인터셉터가 즉시 반영합니다.
 */
export const MockRoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<AdminRole>(getMockActorRole());

  const setRole = (next: AdminRole) => {
    setMockActorRole(next);
    setRoleState(next);
  };

  return (
    <MockRoleContext.Provider value={{ role, setRole }}>
      {children}
    </MockRoleContext.Provider>
  );
};

/**
 * @public
 * @description MockRoleProvider 하위에서 현재 역할과 setter를 반환합니다.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useMockRole = (): MockRoleContextValue => {
  const ctx = useContext(MockRoleContext);
  if (!ctx) {
    throw new Error("useMockRole must be used within MockRoleProvider");
  }
  return ctx;
};
