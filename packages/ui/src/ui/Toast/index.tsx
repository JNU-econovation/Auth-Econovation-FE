import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

export type ToastKind = "success" | "error" | "info";

/** 토스트를 띄우는 함수. `useToast()`로 획득합니다. */
export type PushToast = (kind: ToastKind, msg: ReactNode, sub?: ReactNode) => void;

interface ToastItem {
  id: number;
  kind: ToastKind;
  msg: ReactNode;
  sub?: ReactNode;
}

const ToastCtx = createContext<PushToast | null>(null);

const KIND_CLASS: Record<ToastKind, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-ink",
};

// 자동 닫힘(ms). 에러는 사용자가 직접 닫습니다.
const AUTO_DISMISS: Record<ToastKind, number | null> = {
  success: 4000,
  info: 8000,
  error: null,
};

/**
 * 토스트 스택 Provider. 앱 루트를 감싸 사용하며, 하위에서 `useToast()`로 호출합니다.
 * 최대 3개까지 유지하고 종류별로 자동/수동 닫힘을 적용합니다.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback(
    (id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)),
    [],
  );

  const push = useCallback<PushToast>(
    (kind, msg, sub) => {
      const id = ++idRef.current;
      setToasts((ts) => [...ts.slice(-2), { id, kind, msg, sub }]); // 최대 3개
      const dur = AUTO_DISMISS[kind];
      if (dur) setTimeout(() => dismiss(id), dur);
    },
    [dismiss],
  );

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed right-6 bottom-6 z-[200] flex w-[380px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cx(
              "flex animate-toast-in items-start gap-3 rounded-lg px-4 py-3 text-sm leading-[22px] text-white shadow-modal motion-reduce:animate-none",
              KIND_CLASS[t.kind],
            )}
          >
            <div className="flex-1">
              {t.msg}
              {t.sub ? (
                <small className="mt-0.5 block text-xs leading-[18px] opacity-80">
                  {t.sub}
                </small>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="닫기"
              className="grid h-5 w-5 flex-none cursor-pointer place-items-center rounded border-none bg-transparent text-sm leading-none text-white opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

/** 토스트 push 함수를 반환합니다. `<ToastProvider>` 내부에서만 호출하세요. */
export const useToast = (): PushToast => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};
