import { useState, type FormEvent } from "react";
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
import useAdminClientQuery from "@/hooks/features/query/querys/useAdminClientQuery";
import usePostClientRedirectUri from "@/hooks/features/query/mutations/usePostClientRedirectUri";
import {
  resolveApiErrorCode,
  resolveApiErrorMessage,
} from "@/lib/resolveApiError";
import { isValidUrl } from "@/lib/validators";
import { inputClass } from "@/lib/inputClass";
import DeleteUriModal from "@/components/clients/DeleteUriModal";
import ReplaceUrisModal from "@/components/clients/ReplaceUrisModal";

const PAGE_CLASS = "w-full max-w-[1144px] p-8";

interface ClientDetailProps {
  clientId: string;
}

/**
 * 클라이언트 상세 + redirect URI 관리. 기본 정보(clientId)와 URI 목록을 보여주고,
 * URI 단건 추가/삭제와 전체 교체(diff 확인)를 제공합니다.
 */
const ClientDetail = ({ clientId }: ClientDetailProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const clientQuery = useAdminClientQuery({ clientId });
  const addUri = usePostClientRedirectUri();

  const [deleting, setDeleting] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [addValue, setAddValue] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = addValue.trim();
    if (!trimmed) {
      setAddError("URI를 입력하세요.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setAddError("URL 형식이 아닙니다.");
      return;
    }
    addUri.mutate(
      { clientId, uri: trimmed },
      {
        onSuccess: () => {
          setAddValue("");
          setAddError(null);
          toast("success", "URI를 추가했습니다.");
        },
        onError: (err) => {
          if (resolveApiErrorCode(err) === "DUPLICATE_RESOURCE") {
            setAddError("이미 등록된 URI입니다.");
          } else {
            toast(
              "error",
              "URI를 추가하지 못했습니다.",
              resolveApiErrorMessage(err),
            );
          }
        },
      },
    );
  };

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
                전체 교체
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
                    <Button
                      variant="ghost-danger"
                      size="sm"
                      onClick={() => setDeleting(uri)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <form
              onSubmit={handleAdd}
              noValidate
              className="mt-4 flex items-start gap-2"
            >
              <div className="flex-1">
                <input
                  className={inputClass({ mono: true, error: !!addError })}
                  placeholder="https://new.app.econo.com/callback"
                  value={addValue}
                  onChange={(e) => {
                    setAddValue(e.target.value);
                    setAddError(null);
                  }}
                />
                {addError ? (
                  <div className="mt-2 text-xs text-danger">{addError}</div>
                ) : null}
              </div>
              <Button
                variant="secondary"
                type="submit"
                loading={addUri.isPending}
              >
                URI 추가
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      {deleting ? (
        <DeleteUriModal
          clientId={clientId}
          uri={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            toast("success", "URI를 삭제했습니다.");
          }}
        />
      ) : null}

      {replacing ? (
        <ReplaceUrisModal
          clientId={clientId}
          current={client.redirectUris}
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
