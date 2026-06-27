import { useRef, useState } from "react";
import { Banner, Button, Modal, useToast } from "@auth-econovation/ui";
import type { ClientRoute } from "@auth-econovation/api/clients";
import usePutSelfClient from "@/hooks/features/query/mutations/usePutSelfClient";
import { resolveApiErrorMessage } from "@/lib/resolveApiError";
import { isValidUrl } from "@/lib/validators";
import { inputClass } from "@/lib/inputClass";

interface ReplaceUrisModalProps {
  clientId: string;
  /** 현재 클라이언트 이름(전체 표현 교체 시 보존 전송). */
  clientName: string;
  /** 현재 등록된 redirect URI 목록(diff 기준) */
  current: string[];
  /** 연결된 Gateway 라우트(전체 표현 교체 시 함께 보내 유지, 없으면 null) */
  route: ClientRoute | null;
  onClose: () => void;
  /** 교체 성공 시 호출(부모가 모달 닫기·토스트 처리) */
  onReplaced: () => void;
}

interface EditRow {
  id: number;
  value: string;
}

const DIFF_ROW_CLASS =
  "grid grid-cols-[26px_1fr] items-center border-b border-border py-[7px] pr-2.5";

/**
 * redirect URI 전체 교체 모달. 편집(edit) → 변경 내용 확인(diff) 2단계로 진행하며,
 * 삭제가 포함된 파괴적 교체는 경고와 danger 액션으로 강조합니다.
 *
 * 셀프 클라이언트 수정은 전체 표현을 교체(`PUT /api/v1/clients/{clientId}`)하므로,
 * redirect URI만 바꿔도 clientName과 연결 라우트(pathPrefix·upstreamUrl)를 함께 보내
 * 의도치 않은 변경/라우트 삭제를 막습니다.
 */
const ReplaceUrisModal = ({
  clientId,
  clientName,
  current,
  route,
  onClose,
  onReplaced,
}: ReplaceUrisModalProps) => {
  const toast = useToast();
  const replaceUris = usePutSelfClient();
  const [step, setStep] = useState<"edit" | "diff">("edit");
  const [rows, setRows] = useState<EditRow[]>(
    current.length
      ? current.map((value, i) => ({ id: i + 1, value }))
      : [{ id: 1, value: "" }],
  );
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(current.length + 1);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // 중복 입력은 1건으로 합쳐 전송(전체 교체 PUT은 서버에서 중복 제거를 보장하지 않음)
  const next = [...new Set(rows.map((r) => r.value.trim()).filter(Boolean))];
  const added = next.filter((u) => !current.includes(u));
  const removed = current.filter((u) => !next.includes(u));
  const kept = current.filter((u) => next.includes(u));
  const destructive = removed.length > 0;

  const addRow = () => {
    const id = nextId.current++;
    setRows((rs) => [...rs, { id, value: "" }]);
  };

  const toDiff = () => {
    if (next.length === 0) {
      setError("URI를 1개 이상 입력하세요.");
      return;
    }
    const invalid = next.find((u) => !isValidUrl(u));
    if (invalid) {
      setError(`URL 형식이 아닙니다: ${invalid}`);
      return;
    }
    setError(null);
    setStep("diff");
  };

  const confirm = () => {
    replaceUris.mutate(
      {
        clientId,
        data: {
          clientName,
          redirectUris: next,
          // 라우트가 있으면 함께 보내 유지(생략 시 서버가 라우트를 삭제함)
          ...(route
            ? { pathPrefix: route.pathPrefix, upstreamUrl: route.upstreamUrl }
            : {}),
        },
      },
      {
        onSuccess: onReplaced,
        onError: (err) =>
          toast(
            "error",
            "목록을 교체하지 못했습니다.",
            resolveApiErrorMessage(err),
          ),
      },
    );
  };

  if (step === "edit") {
    return (
      <Modal
        title="redirect URI 수정"
        onClose={onClose}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button variant="primary" onClick={toDiff}>
              변경 내용 확인
            </Button>
          </>
        }
      >
        <p className="text-xs leading-[18px] text-ink-soft">
          아래 목록이 기존 목록을 통째로 대체합니다. 확인 단계에서 변경 내용을
          다시 보여드립니다.
        </p>
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-start gap-2">
              <input
                className={inputClass({ mono: true })}
                placeholder="https://app.example.com/oauth/callback"
                value={row.value}
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((x) =>
                      x.id === row.id ? { ...x, value: e.target.value } : x,
                    ),
                  )
                }
              />
              {rows.length > 1 ? (
                <Button
                  variant="ghost-danger"
                  type="button"
                  onClick={() =>
                    setRows((rs) => rs.filter((x) => x.id !== row.id))
                  }
                >
                  행 삭제
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <div>
          <Button variant="ghost" type="button" onClick={addRow}>
            + URI 추가
          </Button>
        </div>
        {error ? <div className="text-xs text-danger">{error}</div> : null}
      </Modal>
    );
  }

  return (
    <Modal
      title="변경 내용 확인 — 전체 교체"
      onClose={onClose}
      busy={replaceUris.isPending}
      wide
      initialFocusRef={destructive ? cancelRef : undefined}
      footer={
        <>
          <span className="mr-auto">
            <Button
              variant="ghost-plain"
              onClick={() => setStep("edit")}
              disabled={replaceUris.isPending}
            >
              편집으로 돌아가기
            </Button>
          </span>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={replaceUris.isPending}
            ref={cancelRef}
          >
            취소
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={confirm}
            loading={replaceUris.isPending}
          >
            전체 교체
          </Button>
        </>
      }
    >
      <div className="overflow-hidden rounded-md border border-border font-mono text-[13px] leading-5 [&>div:last-child]:border-b-0">
        {kept.map((u) => (
          <div key={`k-${u}`} className={DIFF_ROW_CLASS}>
            <span className="text-center font-bold text-ink-soft" />
            <span className="truncate">{u}</span>
          </div>
        ))}
        {added.map((u) => (
          <div key={`a-${u}`} className={`${DIFF_ROW_CLASS} bg-success-weak`}>
            <span className="text-center font-bold text-success">+</span>
            <span className="truncate">{u}</span>
          </div>
        ))}
        {removed.map((u) => (
          <div key={`d-${u}`} className={`${DIFF_ROW_CLASS} bg-danger-weak`}>
            <span className="text-center font-bold text-danger">−</span>
            <span className="truncate text-danger line-through">{u}</span>
          </div>
        ))}
      </div>
      {destructive ? (
        <Banner kind="warning">{removed.length}개 URI가 즉시 차단됩니다.</Banner>
      ) : null}
    </Modal>
  );
};

export default ReplaceUrisModal;
