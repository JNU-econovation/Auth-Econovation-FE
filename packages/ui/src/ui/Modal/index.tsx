import { useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { cx } from "../../lib/cx";

interface ModalProps {
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  /** 처리 중에는 Esc·바깥 클릭 닫기를 막습니다. */
  busy?: boolean;
  wide?: boolean;
  /** 진입 시 포커스를 줄 요소 ref (미지정 시 첫 포커스 가능 요소) */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * 접근성 모달. Esc·바깥 클릭 닫기, 진입 포커스 이동, 종료 시 포커스 복원을 지원합니다.
 * 오버레이/모달 표시는 호출부의 조건부 렌더링으로 제어합니다.
 */
const Modal = ({
  title,
  children,
  footer,
  onClose,
  busy = false,
  wide = false,
  initialFocusRef,
}: ModalProps) => {
  const boxRef = useRef<HTMLDivElement>(null);

  // 진입 시 포커스 이동, 언마운트 시 직전 포커스 복원
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const target =
      initialFocusRef?.current ??
      boxRef.current?.querySelector<HTMLElement>(
        "button, input, select, textarea",
      );
    target?.focus();
    return () => prev?.focus?.();
    // 진입 시 1회만 실행 (포커스 트랩 초기화)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc 닫기 (busy 중에는 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] grid animate-fade place-items-center bg-[rgba(26,31,46,0.4)] motion-reduce:animate-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        className={cx(
          "flex max-h-[calc(100vh-80px)] max-w-[calc(100vw-48px)] animate-modal-in flex-col rounded-xl bg-white shadow-modal motion-reduce:animate-none",
          wide ? "w-[560px]" : "w-[480px]",
        )}
      >
        <div className="px-6 pt-6">
          <h2 className="text-base font-semibold leading-6">{title}</h2>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
          {children}
        </div>
        {footer ? (
          <div className="flex justify-end gap-2 px-6 pt-2 pb-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

export default Modal;
