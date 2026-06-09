import { useState } from "react";
import { Select, Spacing, Text } from "@auth-econovation/ui";
import type { AdminMember, AdminRole } from "@auth-econovation/api/admin";
import useAdminMembersQuery from "@/hooks/features/query/querys/useAdminMembersQuery";
import usePatchMemberRole from "@/hooks/features/query/mutations/usePatchMemberRole";
import { resolveApiErrorMessage } from "@/lib/resolveApiError";

const ROLES: AdminRole[] = ["USER", "ADMIN", "SUPER_ADMIN"];
const PAGE_SIZE = 20;

const pagerButtonClass =
  "rounded-lg border border-input-border-gray px-3 py-1 text-sm disabled:opacity-40";

/**
 * 회원 역할 관리 테이블.
 *
 * 페이지네이션 + 역할 필터로 회원을 조회하고, 행별 Select로 역할을 변경합니다.
 * 역할 변경은 SUPER_ADMIN 전용이며, 권한 부족/본인 변경/마지막 SUPER_ADMIN 강등 등은
 * 서버 에러 메시지로 안내합니다.
 */
const MemberRoleTable = () => {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<AdminRole | "">("");
  const [error, setError] = useState("");

  const query = useAdminMembersQuery({
    page,
    size: PAGE_SIZE,
    ...(roleFilter ? { role: roleFilter } : {}),
  });
  const patch = usePatchMemberRole();

  const handleRoleChange = (member: AdminMember, nextRole: AdminRole) => {
    if (nextRole === member.role) return;
    setError("");
    patch.mutate(
      { memberId: member.memberId, role: nextRole },
      { onError: (err) => setError(resolveApiErrorMessage(err)) },
    );
  };

  const data = query.data;

  return (
    <section>
      <div className="flex items-center justify-between">
        <Text size="3">회원 역할 관리</Text>
        <label className="flex items-center gap-2">
          <Text size="8" color="gray1">
            역할 필터
          </Text>
          <Select
            value={roleFilter}
            aria-label="역할 필터"
            onChange={(e) => {
              setPage(0);
              setRoleFilter(e.target.value as AdminRole | "");
            }}
          >
            <option value="">전체</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <Spacing size={16} />

      {query.isLoading && (
        <Text size="6" color="gray1">
          불러오는 중...
        </Text>
      )}
      {query.isError && (
        <Text size="6" color="error">
          {resolveApiErrorMessage(query.error, "회원 목록을 불러오지 못했습니다.")}
        </Text>
      )}
      {error && (
        <>
          <Text size="7" color="error">
            {error}
          </Text>
          <Spacing size={8} />
        </>
      )}

      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-input-border-gray">
                  <th className="py-2 pr-3">
                    <Text size="8" color="gray1">
                      ID
                    </Text>
                  </th>
                  <th className="py-2 pr-3">
                    <Text size="8" color="gray1">
                      이름
                    </Text>
                  </th>
                  <th className="py-2 pr-3">
                    <Text size="8" color="gray1">
                      로그인 ID
                    </Text>
                  </th>
                  <th className="py-2 pr-3">
                    <Text size="8" color="gray1">
                      기수
                    </Text>
                  </th>
                  <th className="py-2">
                    <Text size="8" color="gray1">
                      역할
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((m) => (
                  <tr
                    key={m.memberId}
                    className="border-b border-input-border-gray"
                  >
                    <td className="py-2 pr-3">
                      <Text size="7">{m.memberId}</Text>
                    </td>
                    <td className="py-2 pr-3">
                      <Text size="7">{m.name}</Text>
                    </td>
                    <td className="py-2 pr-3">
                      <Text size="7">{m.loginId}</Text>
                    </td>
                    <td className="py-2 pr-3">
                      <Text size="7">{m.generation}</Text>
                    </td>
                    <td className="py-2">
                      <Select
                        value={m.role}
                        aria-label={`${m.name} 역할`}
                        disabled={patch.isPending}
                        onChange={(e) =>
                          handleRoleChange(m, e.target.value as AdminRole)
                        }
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Spacing size={16} />
          <div className="flex items-center justify-between">
            <Text size="7" color="gray1">
              전체 {data.totalElements}명 · {data.page + 1}/
              {Math.max(1, data.totalPages)} 페이지
            </Text>
            <div className="flex gap-2">
              <button
                type="button"
                className={pagerButtonClass}
                disabled={data.page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </button>
              <button
                type="button"
                className={pagerButtonClass}
                disabled={data.page + 1 >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default MemberRoleTable;
