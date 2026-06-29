import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  IdChip,
  InfoHint,
  Skeleton,
  useToast,
} from "@auth-econovation/ui";
import useSelfClientQuery from "@/hooks/features/query/querys/useSelfClientQuery";
import ReplaceUrisModal from "@/components/clients/ReplaceUrisModal";
import EditGatewayModal from "@/components/clients/EditGatewayModal";

const PAGE_CLASS = "w-full max-w-[1144px] p-8";

interface ClientDetailProps {
  clientId: string;
}

/**
 * 클라이언트 상세 화면. 기본 정보(clientId)·게이트웨이 설정(pathPrefix·upstreamUrl)·
 * redirect URI 목록을 보여주고, 게이트웨이 설정과 URI를 각각 "수정하기" 모달로 편집합니다.
 * 셀프 클라이언트 수정은 전체 표현 교체(`PUT`)이므로, 한 영역만 바꿔도 나머지(clientName·
 * redirectUris·route)를 함께 전송해 의도치 않은 변경/라우트 삭제를 막습니다.
 */
const ClientDetail = ({ clientId }: ClientDetailProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const clientQuery = useSelfClientQuery({ clientId });

  const [replacing, setReplacing] = useState(false);
  const [editingGateway, setEditingGateway] = useState(false);

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

        {/* 게이트웨이 설정 */}
        <Card>
          <CardHeader
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingGateway(true)}
              >
                수정하기
              </Button>
            }
          >
            게이트웨이 설정
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex w-[104px] flex-none items-center gap-1 text-xs text-ink-soft">
                pathPrefix
                <InfoHint label="pathPrefix 설명">
                  <strong className="mb-1 block">pathPrefix</strong>
                  게이트웨이가 이 서비스로 요청을 라우팅할 때 사용하는 경로
                  접두사입니다. 예: <code>/api/econo-spa</code>로 시작하는 요청을
                  이 클라이언트로 전달합니다.
                </InfoHint>
              </span>
              {client.route ? (
                <IdChip
                  value={client.route.pathPrefix}
                  className="min-w-0 flex-1"
                />
              ) : (
                <span className="text-sm text-ink-soft">미설정</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="flex w-[104px] flex-none items-center gap-1 text-xs text-ink-soft">
                upstreamUrl
                <InfoHint label="upstreamUrl 설명">
                  <strong className="mb-1 block">upstreamUrl</strong>
                  요청이 실제로 전달되는 서비스(오리진) 주소입니다. 게이트웨이가
                  받은 요청을 이 URL로 프록시해 전달합니다.
                </InfoHint>
              </span>
              {client.route ? (
                <IdChip
                  value={client.route.upstreamUrl}
                  className="min-w-0 flex-1"
                />
              ) : (
                <span className="text-sm text-ink-soft">미설정</span>
              )}
            </div>
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

      {editingGateway ? (
        <EditGatewayModal
          clientId={clientId}
          clientName={client.clientName}
          redirectUris={client.redirectUris}
          route={client.route}
          onClose={() => setEditingGateway(false)}
          onSaved={() => {
            setEditingGateway(false);
            toast("success", "게이트웨이 설정을 저장했습니다.");
          }}
        />
      ) : null}
    </div>
  );
};

export default ClientDetail;
