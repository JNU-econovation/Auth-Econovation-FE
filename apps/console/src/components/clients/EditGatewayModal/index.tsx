import { useState } from "react";
import { Banner, Button, InfoHint, Modal, useToast } from "@auth-econovation/ui";
import type { ClientRoute } from "@auth-econovation/api/clients";
import usePutSelfClient from "@/hooks/features/query/mutations/usePutSelfClient";
import {
  resolveApiErrorCode,
  resolveApiErrorMessage,
} from "@/lib/resolveApiError";
import { isValidNamespacePrefix, isValidUrl } from "@/lib/validators";
import { inputClass } from "@/lib/inputClass";

interface EditGatewayModalProps {
  clientId: string;
  /** 현재 클라이언트 이름(전체 표현 교체 시 보존 전송). */
  clientName: string;
  /** 현재 등록된 redirect URI 목록(전체 표현 교체 시 보존 전송). */
  redirectUris: string[];
  /** 현재 연결된 Gateway 라우트(없으면 null) */
  route: ClientRoute | null;
  onClose: () => void;
  /** 저장 성공 시 호출(부모가 모달 닫기·토스트 처리) */
  onSaved: () => void;
}

/** 서버가 라우트 필드 단위로 내려주는 에러 코드(필드 하단에 메시지 표시). */
const ROUTE_ERROR_CODES = new Set([
  "ROUTE_NAMESPACE_INVALID",
  "ROUTE_UPSTREAM_INVALID",
  "ROUTE_PATH_CONFLICT",
  "ROUTE_NAMESPACE_TAKEN",
  "ROUTE_PROTECTED",
  "ROUTE_NAMESPACE_CHANGE_DENIED",
]);

/**
 * 게이트웨이 설정(pathPrefix·upstreamUrl) 수정 모달.
 *
 * 셀프 클라이언트 수정은 전체 표현 교체(`PUT /api/v1/clients/{clientId}`)이므로,
 * 라우트만 바꿔도 clientName·redirectUris를 함께 보내 의도치 않은 변경을 막습니다.
 * pathPrefix·upstreamUrl은 "둘 다 입력" 또는 "둘 다 비움"만 허용하며,
 * 기존 라우트가 있는 상태에서 둘 다 비우면 라우트가 삭제(게이트웨이 라우팅 중단)됩니다.
 */
const EditGatewayModal = ({
  clientId,
  clientName,
  redirectUris,
  route,
  onClose,
  onSaved,
}: EditGatewayModalProps) => {
  const toast = useToast();
  const updateClient = usePutSelfClient();
  const [pathPrefix, setPathPrefix] = useState(route?.pathPrefix ?? "");
  const [upstreamUrl, setUpstreamUrl] = useState(route?.upstreamUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  const path = pathPrefix.trim();
  const upstream = upstreamUrl.trim();
  const hasRoute = path !== "" && upstream !== "";
  // 기존 라우트가 있는데 둘 다 비우면 라우트 삭제(게이트웨이 프록시 중단)
  const destructive = route !== null && !path && !upstream;

  /** pathPrefix·upstreamUrl은 "둘 다 입력 또는 둘 다 비움"만 허용합니다. */
  const validate = (): string | null => {
    if (!path && !upstream) return null;
    if (!path || !upstream)
      return "pathPrefix와 upstreamUrl은 함께 입력해야 합니다.";
    if (!isValidNamespacePrefix(path))
      return "pathPrefix는 /api/{namespace} 형태여야 합니다.";
    if (!isValidUrl(upstream))
      return "upstreamUrl이 올바른 URL 형식이 아닙니다.";
    return null;
  };

  const save = () => {
    const err = validate();
    setError(err);
    if (err) return;

    updateClient.mutate(
      {
        clientId,
        data: {
          clientName,
          redirectUris,
          // 둘 다 있으면 라우트 upsert, 둘 다 생략하면 서버가 기존 라우트를 삭제함
          ...(hasRoute ? { pathPrefix: path, upstreamUrl: upstream } : {}),
        },
      },
      {
        onSuccess: onSaved,
        onError: (e) => {
          const code = resolveApiErrorCode(e);
          if (code && ROUTE_ERROR_CODES.has(code)) {
            setError(resolveApiErrorMessage(e));
          } else {
            toast(
              "error",
              "게이트웨이 설정을 저장하지 못했습니다.",
              resolveApiErrorMessage(e),
            );
          }
        },
      },
    );
  };

  return (
    <Modal
      title="게이트웨이 설정 수정"
      onClose={onClose}
      busy={updateClient.isPending}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={updateClient.isPending}
          >
            취소
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={save}
            loading={updateClient.isPending}
          >
            저장
          </Button>
        </>
      }
    >
      {/* pathPrefix */}
      <div>
        <label
          htmlFor="edit-path-prefix"
          className="mb-2 flex w-fit items-center gap-1 text-sm font-medium"
        >
          pathPrefix
          <InfoHint label="pathPrefix 설명">
            <strong className="mb-1 block">pathPrefix</strong>
            해당 값은 입력한 접두사의 주소로 보내지는 모든 요청을 upstreamUrl로
            전달합니다. 해당 서비스만의 접두사를 등록해주세요!
            <br /> <br />
            e.g.) api를 접두사로 등록했다면 게이트웨이로 오는 /api/hello 요청은
            [upstreamUrl]/hello로 전달됩니다.
            <br />
            <br />
            <strong className="mb-1 block">게이트웨이란?</strong>
            EEOS가 제공하는 인증 서버입니다. 서비스에서 사용하는 모든 요청은
            게이트웨이를 거치도록 하여 인증해야합니다
          </InfoHint>
        </label>
        <input
          id="edit-path-prefix"
          className={inputClass({ mono: true, error: !!error })}
          placeholder="/api/econo-spa"
          value={pathPrefix}
          onChange={(e) => {
            setPathPrefix(e.target.value);
            setError(null);
          }}
        />
        <div className="mt-2 text-xs text-ink-soft">
          선택 입력. 게이트웨이 라우팅 경로 접두사입니다.
        </div>
      </div>

      {/* upstreamUrl */}
      <div>
        <label
          htmlFor="edit-upstream-url"
          className="mb-2 flex w-fit items-center gap-1 text-sm font-medium"
        >
          upstreamUrl
          <InfoHint label="upstreamUrl 설명">
            <strong className="mb-1 block">upstreamUrl</strong>
            요청이 실제로 전달되는 서비스(오리진) 주소입니다. 게이트웨이가 받은
            요청을 이 URL로 프록시해 전달합니다.
            <br />
            여러분의 백엔드 서비스 주소를 입력해주세요.
          </InfoHint>
        </label>
        <input
          id="edit-upstream-url"
          className={inputClass({ mono: true, error: !!error })}
          placeholder="https://app.econo.com"
          value={upstreamUrl}
          onChange={(e) => {
            setUpstreamUrl(e.target.value);
            setError(null);
          }}
        />
        {error ? (
          <div className="mt-2 text-xs text-danger">{error}</div>
        ) : (
          <div className="mt-2 text-xs text-ink-soft">
            선택 입력. pathPrefix와 함께 입력하면 게이트웨이 라우트를 함께
            등록합니다.
          </div>
        )}
      </div>

      {destructive ? (
        <Banner kind="warning">
          저장하면 게이트웨이 라우트가 삭제되어 이 경로로의 프록시가 중단됩니다.
        </Banner>
      ) : null}
    </Modal>
  );
};

export default EditGatewayModal;
