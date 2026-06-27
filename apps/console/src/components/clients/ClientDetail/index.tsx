import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  IdChip,
  Skeleton,
  useToast,
} from "@auth-econovation/ui";
import useSelfClientQuery from "@/hooks/features/query/querys/useSelfClientQuery";
import ReplaceUrisModal from "@/components/clients/ReplaceUrisModal";

const PAGE_CLASS = "w-full max-w-[1144px] p-8";

interface ClientDetailProps {
  clientId: string;
}

/**
 * 클라이언트 상세 + redirect URI 관리. 기본 정보(clientId)와 URI 목록을 보여주고,
 * URI 편집은 "수정하기"(전체 교체 + diff) 흐름 하나로 일원화합니다. redirect URI를 교체할 때는
 * 연결된 Gateway 라우트가 유지되도록 현재 clientName·route를 함께 전송합니다.
 */
const ClientDetail = ({ clientId }: ClientDetailProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const clientQuery = useSelfClientQuery({ clientId });

  const [replacing, setReplacing] = useState(false);

  if (clientQuery.status === "pending") {
    return (
      <div className={PAGE_CLASS}>
        <div className="mb-6">
          <Skeleton w={220} h={26} />
          <div className="mt-2">
            <Skeleton w={90} h={14} />
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <Skeleton w="55%" h={20} />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Skeleton w="70%" h={20} className="mb-3" />
              <Skeleton w="62%" h={20} />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (clientQuery.status === "error") {
    return (
      <div className={PAGE_CLASS}>
        <Card>
          <EmptyState
            title="존재하지 않는 클라이언트입니다"
            desc="clientId를 다시 확인해 주세요."
            action={
              <Button variant="secondary" onClick={() => navigate("/clients")}>
                목록으로
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const client = clientQuery.data;

  return (
    <div className={PAGE_CLASS}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl leading-8 font-bold tracking-[-0.01em]">
          {client.clientName}
        </h1>
        <Button variant="ghost-plain" onClick={() => navigate("/clients")}>
          목록으로
        </Button>
      </div>

      <div className="space-y-4">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>기본 정보</CardHeader>
          <CardBody className="flex items-center gap-4">
            <span className="w-[72px] flex-none text-xs text-ink-soft">
              clientId
            </span>
            <IdChip value={client.clientId} />
          </CardBody>
        </Card>

        {/* Redirect URI 관리 */}
        <Card>
          <CardHeader
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReplacing(true)}
              >
                수정하기
              </Button>
            }
          >
            Redirect URI ({client.redirectUris.length})
          </CardHeader>
          <CardBody>
            {client.redirectUris.length === 0 ? (
              <EmptyState
                title="등록된 URI가 없습니다"
                desc="로그인 연동 전에 URI를 추가하세요."
              />
            ) : (
              <div className="divide-y divide-border">
                {client.redirectUris.map((uri) => (
                  <div key={uri} className="flex items-center gap-2 py-2">
                    <IdChip value={uri} className="min-w-0 flex-1" />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {replacing ? (
        <ReplaceUrisModal
          clientId={clientId}
          clientName={client.clientName}
          current={client.redirectUris}
          route={client.route}
          onClose={() => setReplacing(false)}
          onReplaced={() => {
            setReplacing(false);
            toast("success", "redirect URI 목록을 교체했습니다.");
          }}
        />
      ) : null}
    </div>
  );
};

export default ClientDetail;
