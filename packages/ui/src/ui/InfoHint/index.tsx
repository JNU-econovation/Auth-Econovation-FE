import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { InfoIcon } from "../../icons";

interface InfoHintProps {
  /** 토글 버튼의 aria-label(스크린리더용 설명). */
  label?: string;
  /** 팝오버 본문. `<code>`·`<strong>` 등 인라인 마크업을 그대로 사용할 수 있습니다. */
  children: ReactNode;
  /** 팝오버 정렬 기준(트리거 좌측/우측). 기본 left. */
  align?: "left" | "right";
}

/**
 * 라벨 옆 클릭 토글 정보 팁. 필드 의미(pathPrefix 등)를 본문 흐름을 방해하지 않고 보충합니다.
 * 바깥 클릭·Esc로 닫히며, 팝오버는 식별자 코드 표기를 위한 `<code>` 스타일을 포함합니다.
 */
const InfoHint = ({ label = "설명 보기", children, align = "left" }: InfoHintProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-grid h-[18px] w-[18px] flex-none cursor-pointer place-items-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          open
            ? "bg-info-weak text-info"
            : "text-gray hover:bg-info-weak hover:text-info",
        )}
      >
        <InfoIcon className="h-[15px] w-[15px]" />
      </button>
      {open ? (
        <span
          role="tooltip"
          className={cx(
            "absolute top-[calc(100%+9px)] z-50 w-max max-w-[320px] rounded-lg bg-ink px-3 py-2.5",
            "text-xs leading-[18px] font-normal whitespace-normal text-white shadow-modal",
            "before:absolute before:bottom-full before:border-[6px] before:border-transparent before:border-b-ink before:content-['']",
            "[&_code]:rounded [&_code]:bg-white/15 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.95em]",
            align === "right"
              ? "right-0 before:right-[10px]"
              : "left-0 before:left-[10px]",
          )}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
};

export default InfoHint;
