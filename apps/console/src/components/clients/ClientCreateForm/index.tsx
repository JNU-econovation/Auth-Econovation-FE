import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  Banner,
  Button,
  Card,
  CardBody,
  IdChip,
  InfoHint,
  Modal,
  useToast,
} from "@auth-econovation/ui";
import type { PostClientApiResponse } from "@auth-econovation/api/clients";
import usePostSelfClient from "@/hooks/features/query/mutations/usePostSelfClient";
import {
  resolveApiErrorCode,
  resolveApiErrorMessage,
} from "@/lib/resolveApiError";
import { isValidUrl } from "@/lib/validators";
import { inputClass } from "@/lib/inputClass";

interface UriRow {
  id: number;
  value: string;
  error: string | null;
  warn: string | null;
}

/** pathPrefix가 `/api/{namespace}` 형태인지(서버 검증 규칙과 정렬). */
const isValidNamespacePrefix = (value: string): boolean =>
  /^\/api\/[A-Za-z0-9._~-]+(\/.*)?$/.test(value);

/** 서버가 라우트 필드 단위로 내려주는 에러 코드(필드 하단에 메시지 표시). */
const ROUTE_ERROR_CODES = new Set([
  "ROUTE_NAMESPACE_INVALID",
  "ROUTE_UPSTREAM_INVALID",
  "ROUTE_PATH_CONFLICT",
  "ROUTE_NAMESPACE_TAKEN",
  "ROUTE_PROTECTED",
  "ROUTE_NAMESPACE_CHANGE_DENIED",
]);

const validateName = (value: string): string | null =>
  value.trim() === "" ? "클라이언트 이름을 입력하세요." : null;

const validateUri = (
  value: string,
): { error: string | null; warn: string | null } => {
  const trimmed = value.trim();
  if (trimmed === "") return { error: null, warn: null };
  if (!isValidUrl(trimmed))
    return { error: "URL 형식이 아닙니다.", warn: null };
  if (!trimmed.startsWith("https://"))
    return { error: null, warn: "https:// 사용을 권장합니다." };
  return { error: null, warn: null };
};

/**
 * 클라이언트 등록 폼. 이름 + 동적 redirect URI 리스트에 더해 선택적으로 Gateway 라우트
 * (pathPrefix·upstreamUrl)를 함께 입력받아 셀프 등록(`POST /api/v1/clients`)하고,
 * 성공 시 1회 노출되는 clientId·clientSecret을 모달로 안내한 뒤 상세 페이지로 이동합니다.
 */
const ClientCreateForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const createClient = usePostSelfClient();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [uris, setUris] = useState<UriRow[]>([
    { id: 1, value: "", error: null, warn: null },
  ]);
  const [listError, setListError] = useState<string | null>(null);
  const [pathPrefix, setPathPrefix] = useState("");
  const [upstreamUrl, setUpstreamUrl] = useState("");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [created, setCreated] = useState<PostClientApiResponse | null>(null);
  const nextId = useRef(2);

  const patchUri = (id: number, patch: Partial<UriRow>) =>
    setUris((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => {
    const id = nextId.current++;
    setUris((rows) => [...rows, { id, value: "", error: null, warn: null }]);
  };

  const removeRow = (id: number) =>
    setUris((rows) =>
      rows.length > 1 ? rows.filter((r) => r.id !== id) : rows,
    );

  /** pathPrefix·upstreamUrl은 "둘 다 입력 또는 둘 다 비움"만 허용합니다. */
  const validateRoute = (): string | null => {
    const path = pathPrefix.trim();
    const upstream = upstreamUrl.trim();
    if (!path && !upstream) return null;
    if (!path || !upstream)
      return "pathPrefix와 upstreamUrl은 함께 입력해야 합니다.";
    if (!isValidNamespacePrefix(path))
      return "pathPrefix는 /api/{namespace} 형태여야 합니다.";
    if (!isValidUrl(upstream))
      return "upstreamUrl이 올바른 URL 형식이 아닙니다.";
    return null;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nErr = validateName(name);
    setNameError(nErr);
    let bad = nErr !== null;

    const checked = uris.map((row) => {
      const { error, warn } = validateUri(row.value);
      if (error) bad = true;
      return { ...row, error, warn };
    });
    setUris(checked);

    const rErr = validateRoute();
    setRouteError(rErr);
    if (rErr) bad = true;

    if (bad) return;

    // 빈 행 제거 + 중복 합치기
    const redirectUris = [
      ...new Set(checked.map((r) => r.value.trim()).filter(Boolean)),
    ];
    if (redirectUris.length === 0) {
      setListError("redirect URI를 1개 이상 입력하세요.");
      return;
    }
    setListError(null);

    const path = pathPrefix.trim();
    const upstream = upstreamUrl.trim();
    const hasRoute = path !== "" && upstream !== "";

    createClient.mutate(
      {
        clientName: name.trim(),
        redirectUris,
        ...(hasRoute ? { pathPrefix: path, upstreamUrl: upstream } : {}),
      },
      {
        onSuccess: (response) => setCreated(response),
        onError: (err) => {
          const code = resolveApiErrorCode(err);
          if (code === "DUPLICATE_CLIENT_NAME") {
            setNameError("이미 사용 중인 이름입니다. 다른 이름을 입력하세요.");
          } else if (code === "REDIRECT_URI_REQUIRED") {
            setListError("redirect URI를 1개 이상 입력하세요.");
          } else if (code && ROUTE_ERROR_CODES.has(code)) {
            setRouteError(resolveApiErrorMessage(err));
          } else {
            toast(
              "error",
              "클라이언트를 등록하지 못했습니다.",
              resolveApiErrorMessage(err),
            );
          }
        },
      },
    );
  };

  return (
    <>
      <Card className="max-w-[640px]">
        <CardBody>
          <form onSubmit={handleSubmit} noValidate>
            {/* 클라이언트 이름 */}
            <div className="mb-4">
              <label
                htmlFor="client-name"
                className="mb-2 block text-sm font-medium"
              >
                클라이언트 이름<span className="ml-0.5 text-danger">*</span>
              </label>
              <input
                id="client-name"
                className={inputClass({ error: !!nameError })}
                placeholder="ECONO SPA"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(null);
                }}
                onBlur={() => setNameError(validateName(name))}
              />
              {nameError ? (
                <div className="mt-2 text-xs text-danger">{nameError}</div>
              ) : (
                <div className="mt-2 text-xs text-ink-soft">
                  서비스를 식별하는 표시용 이름입니다.
                </div>
              )}
            </div>

            {/* redirect URI 리스트 */}
            <div className="mb-4">
              <div className="flex gap-1">
                <span className="mb-2 block text-sm font-medium">
                  Redirect URI<span className="ml-0.5 text-danger">*</span>
                </span>
                <InfoHint label="upstreamUrl 설명">
                  <strong className="mb-1 block">Redirect URI</strong>
                  SSO 로그인 후 리다이랙트 될 URI입니다. 로그인 후 리다이랙트될
                  URI를 입력해주세요.
                  <br />
                  여러분의 프론트엔드 서비스 주소 중 로그인을 처리하는 URI를
                  입력하세요
                  <br />
                  <br />
                  <strong className="mb-1 block">TIP!</strong>
                  - 만약 APP 으로 사용한다면 로그인을 처리할 수 있는 페이지를
                  구현해 해당 주소를 입력하세요.
                  <br />- 만약 WEB 으로 사용한다면 쿠키를 사용하므로, 프론트엔드
                  첫 페이지 주소를 입력하세요.
                </InfoHint>
              </div>
              <div className="flex flex-col gap-2">
                {uris.map((row) => (
                  <div key={row.id}>
                    <div className="flex items-start gap-2">
                      <input
                        className={inputClass({
                          mono: true,
                          error: !!row.error,
                        })}
                        placeholder="https://app.example.com/oauth/callback"
                        value={row.value}
                        onChange={(e) =>
                          patchUri(row.id, {
                            value: e.target.value,
                            error: null,
                            warn: null,
                          })
                        }
                        onBlur={() => patchUri(row.id, validateUri(row.value))}
                      />
                      {uris.length > 1 ? (
                        <Button
                          variant="ghost-danger"
                          type="button"
                          onClick={() => removeRow(row.id)}
                        >
                          행 삭제
                        </Button>
                      ) : null}
                    </div>
                    {row.error ? (
                      <div className="mt-2 text-xs text-danger">
                        {row.error}
                      </div>
                    ) : row.warn ? (
                      <div className="mt-2 text-xs text-warning">
                        {row.warn}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Button variant="ghost" type="button" onClick={addRow}>
                  + URI 추가
                </Button>
              </div>
              {listError ? (
                <div className="mt-2 text-xs text-danger">{listError}</div>
              ) : null}
            </div>

            {/* pathPrefix (선택) */}
            <div className="mb-4">
              <label
                htmlFor="path-prefix"
                className="mb-2 flex w-fit items-center gap-1 text-sm font-medium"
              >
                pathPrefix
                <InfoHint label="pathPrefix 설명">
                  <strong className="mb-1 block">pathPrefix</strong>
                  해당 값은 입력한 접두사의 주소로 보내지는 모든 요청을
                  upstreamUrl로 전달합니다. 해당 서비스만의 접두사를
                  등록해주세요!
                  <br /> <br />
                  e.g.) api를 접두사로 등록했다면 게이트웨이로 오는 /api/hello
                  요청은 [upstreamUrl]/hello로 전달됩니다.
                  <br />
                  <br />
                  <strong className="mb-1 block">게이트웨이란?</strong>
                  EEOS가 제공하는 인증 서버입니다. 서비스에서 사용하는 모든
                  요청은 게이트웨이를 거치도록 하여 인증해야합니다
                </InfoHint>
              </label>
              <input
                id="path-prefix"
                className={inputClass({ mono: true, error: !!routeError })}
                placeholder="/api/econo-spa"
                value={pathPrefix}
                onChange={(e) => {
                  setPathPrefix(e.target.value);
                  setRouteError(null);
                }}
              />
              <div className="mt-2 text-xs text-ink-soft">
                선택 입력. 게이트웨이 라우팅 경로 접두사입니다.
              </div>
            </div>

            {/* upstreamUrl (선택) */}
            <div className="mb-4">
              <label
                htmlFor="upstream-url"
                className="mb-2 flex w-fit items-center gap-1 text-sm font-medium"
              >
                upstreamUrl
                <InfoHint label="upstreamUrl 설명">
                  <strong className="mb-1 block">upstreamUrl</strong>
                  요청이 실제로 전달되는 서비스(오리진) 주소입니다. 게이트웨이가
                  받은 요청을 이 URL로 프록시해 전달합니다.
                  <br />
                  여러분의 백엔드 서비스 주소를 입력해주세요.
                </InfoHint>
              </label>
              <input
                id="upstream-url"
                className={inputClass({ mono: true, error: !!routeError })}
                placeholder="https://app.econo.com"
                value={upstreamUrl}
                onChange={(e) => {
                  setUpstreamUrl(e.target.value);
                  setRouteError(null);
                }}
              />
              {routeError ? (
                <div className="mt-2 text-xs text-danger">{routeError}</div>
              ) : (
                <div className="mt-2 text-xs text-ink-soft">
                  선택 입력. pathPrefix와 함께 입력하면 게이트웨이 라우트를 함께
                  등록합니다.
                </div>
              )}
            </div>

            {/* 안내 배너 */}
            <div className="my-6">
              <Banner kind="warning">
                새 환경 배포 전에 URI를 미리 등록해 두세요. 등록되지 않은
                URI로의 로그인은 차단됩니다.
              </Banner>
            </div>

            {/* 액션 */}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                disabled={createClient.isPending}
                onClick={() => navigate("/clients")}
              >
                취소
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={createClient.isPending}
              >
                클라이언트 등록
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {created ? (
        <Modal
          title="클라이언트가 등록되었습니다"
          onClose={() => navigate(`/clients/${created.clientId}`)}
          footer={
            <Button
              variant="primary"
              onClick={() => navigate(`/clients/${created.clientId}`)}
            >
              상세 페이지로 이동
            </Button>
          }
        >
          <Banner kind="warning">
            clientSecret은 지금만 확인할 수 있습니다. 닫기 전에 안전한 곳에
            보관하세요.
          </Banner>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">clientId</span>
            <IdChip value={created.clientId} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">clientSecret</span>
            <IdChip value={created.clientSecret} />
          </div>
          {created.routeId ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">게이트웨이 라우트</span>
              <IdChip value={created.pathPrefix ?? ""} copy={false} />
              <IdChip value={created.upstreamUrl ?? ""} copy={false} />
            </div>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
};

export default ClientCreateForm;
