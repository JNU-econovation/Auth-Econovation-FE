import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  Banner,
  Button,
  Card,
  CardBody,
  IdChip,
  Modal,
  useToast,
} from "@auth-econovation/ui";
import usePostClient from "@/hooks/features/query/mutations/usePostClient";
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

const validateName = (value: string): string | null =>
  value.trim() === "" ? "클라이언트 이름을 입력하세요." : null;

const validateUri = (
  value: string,
): { error: string | null; warn: string | null } => {
  const trimmed = value.trim();
  if (trimmed === "") return { error: null, warn: null };
  if (!isValidUrl(trimmed)) return { error: "URL 형식이 아닙니다.", warn: null };
  if (!trimmed.startsWith("https://"))
    return { error: null, warn: "https:// 사용을 권장합니다." };
  return { error: null, warn: null };
};

/**
 * 클라이언트 등록 폼. 이름 + 동적 redirect URI 리스트를 입력받아 등록하고,
 * 성공 시 발급된 clientId를 모달로 안내한 뒤 상세 페이지로 이동합니다.
 */
const ClientCreateForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const createClient = usePostClient();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [uris, setUris] = useState<UriRow[]>([
    { id: 1, value: "", error: null, warn: null },
  ]);
  const [listError, setListError] = useState<string | null>(null);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);
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

    createClient.mutate(
      { clientName: name.trim(), redirectUris },
      {
        onSuccess: ({ clientId }) => setCreatedClientId(clientId),
        onError: (err) => {
          const code = resolveApiErrorCode(err);
          if (code === "DUPLICATE_RESOURCE") {
            setNameError("이미 사용 중인 이름입니다. 다른 이름을 입력하세요.");
          } else if (code === "REDIRECT_URI_REQUIRED") {
            setListError("redirect URI를 1개 이상 입력하세요.");
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
              <span className="mb-2 block text-sm font-medium">
                Redirect URI<span className="ml-0.5 text-danger">*</span>
              </span>
              <div className="flex flex-col gap-2">
                {uris.map((row) => (
                  <div key={row.id}>
                    <div className="flex items-start gap-2">
                      <input
                        className={inputClass({ mono: true, error: !!row.error })}
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
                      <div className="mt-2 text-xs text-danger">{row.error}</div>
                    ) : row.warn ? (
                      <div className="mt-2 text-xs text-warning">{row.warn}</div>
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

            {/* 안내 배너 */}
            <div className="my-6">
              <Banner kind="warning">
                새 환경 배포 전에 URI를 미리 등록해 두세요. 등록되지 않은 URI로의
                로그인은 차단됩니다.
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

      {createdClientId ? (
        <Modal
          title="클라이언트가 등록되었습니다"
          onClose={() => navigate(`/clients/${createdClientId}`)}
          footer={
            <Button
              variant="primary"
              onClick={() => navigate(`/clients/${createdClientId}`)}
            >
              상세 페이지로 이동
            </Button>
          }
        >
          <p className="text-ink-soft">
            발급된 clientId를 연동 서비스 환경 변수에 등록하세요.
          </p>
          <IdChip value={createdClientId} />
        </Modal>
      ) : null}
    </>
  );
};

export default ClientCreateForm;
