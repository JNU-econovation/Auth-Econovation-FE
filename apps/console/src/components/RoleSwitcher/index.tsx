import { Select, Text } from "@auth-econovation/ui";
import type { AdminRole } from "@auth-econovation/api/admin";
import { useMockRole } from "@/lib/mockRole";

const ROLES: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "USER"];

/**
 * 개발(MSW) 전용 역할 전환기.
 *
 * 선택한 역할이 공유 apiClient 인터셉터를 통해 `X-Mock-Role` 헤더로 주입되므로,
 * 어드민 가드/권한 분기(예: 403 FORBIDDEN, 본인 역할 변경 차단)를 실제 백엔드 없이
 * 로컬에서 검증할 수 있습니다.
 */
const RoleSwitcher = () => {
  const { role, setRole } = useMockRole();

  return (
    <label className="flex items-center gap-2">
      <Text size="8" color="gray1">
        DEV 역할
      </Text>
      <Select
        value={role}
        onChange={(e) => setRole(e.target.value as AdminRole)}
        aria-label="DEV 역할 전환"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>
    </label>
  );
};

export default RoleSwitcher;
