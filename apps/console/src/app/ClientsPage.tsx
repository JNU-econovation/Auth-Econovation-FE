import { useNavigate } from "react-router";
import { Button } from "@auth-econovation/ui";
import { CLIENTS_LIST_MODE } from "@/constants/clientsView";
import ClientsTable from "@/components/clients/ClientsTable";
import ClientsLookupView from "@/components/clients/ClientsLookupView";

/**
 * 클라이언트 목록 페이지(`/clients`).
 *
 * 목록 조회 API 확정 여부에 따라 정식 테이블(`table`)과 clientId 단건 조회 임시 뷰(`lookup`)를
 * `CLIENTS_LIST_MODE` 상수로 전환합니다. 임시 뷰는 조회 전용이라 상단 등록 진입점을 숨깁니다.
 */
const ClientsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[1144px] p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl leading-8 font-bold tracking-[-0.01em]">
          클라이언트
        </h1>
        {CLIENTS_LIST_MODE === "table" ? (
          <Button onClick={() => navigate("/clients/new")}>
            클라이언트 등록
          </Button>
        ) : null}
      </div>
      {CLIENTS_LIST_MODE === "table" ? <ClientsTable /> : <ClientsLookupView />}
    </div>
  );
};

export default ClientsPage;
