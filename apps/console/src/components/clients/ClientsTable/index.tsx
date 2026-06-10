import { useNavigate } from "react-router";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IdChip,
  TableSkeleton,
} from "@auth-econovation/ui";
import useAdminClientsQuery from "@/hooks/features/query/querys/useAdminClientsQuery";
import { resolveApiErrorCode } from "@/lib/resolveApiError";
import { shortId } from "@/lib/validators";

const TH_CLASS =
  "border-b border-border bg-bg-sunken px-4 py-[9px] text-left text-xs font-medium text-ink-soft";
const TD_CLASS = "border-b border-border px-4 py-3 align-middle";

/**
 * 클라이언트 목록 테이블. 목록 조회 API(현재 MSW mock)로 전체 클라이언트를 표시하고
 * 행 클릭 시 상세로 이동합니다. 로딩/에러/빈 상태를 카드 안에서 처리합니다.
 */
const ClientsTable = () => {
  const navigate = useNavigate();
  const clientsQuery = useAdminClientsQuery();

  if (clientsQuery.status === "pending") {
    return (
      <Card className="overflow-hidden">
        <TableSkeleton rows={3} cols={3} />
      </Card>
    );
  }

  if (clientsQuery.status === "error") {
    return (
      <Card>
        <ErrorState
          onRetry={() => {
            void clientsQuery.refetch();
          }}
          errorCode={resolveApiErrorCode(clientsQuery.error) ?? "INTERNAL_SERVER_ERROR"}
        />
      </Card>
    );
  }

  const clients = clientsQuery.data;

  if (clients.length === 0) {
    return (
      <Card>
        <EmptyState
          title="등록된 클라이언트가 없습니다"
          desc="첫 클라이언트를 등록하세요."
          action={
            <Button onClick={() => navigate("/clients/new")}>
              클라이언트 등록
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full border-collapse [&_tbody_tr:last-child>td]:border-b-0">
        <thead>
          <tr>
            <th className={`${TH_CLASS} w-[36%]`}>이름</th>
            <th className={TH_CLASS}>clientId</th>
            <th className={`${TH_CLASS} w-[140px] text-right`}>redirectUri 수</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.clientId}
              onClick={() => navigate(`/clients/${client.clientId}`)}
              className="cursor-pointer transition hover:bg-[rgba(22,45,58,0.04)]"
            >
              <td className={`${TD_CLASS} font-medium`}>{client.clientName}</td>
              <td className={TD_CLASS}>
                <IdChip
                  value={client.clientId}
                  display={shortId(client.clientId)}
                />
              </td>
              <td className={`${TD_CLASS} text-right tabular-nums`}>
                {client.redirectUris.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default ClientsTable;
