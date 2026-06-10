import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { cx } from "../../lib/cx";
import { CopyIcon, CheckIcon } from "../../icons";

interface CopyButtonProps {
  value: string;
  /** 스크린리더용 라벨 */
  label?: string;
  className?: string;
}

/**
 * 클립보드 복사 버튼. 복사 성공 시 1.5초간 체크 아이콘으로 전환됩니다.
 */
const CopyButton = ({ value, label = "복사", className }: CopyButtonProps) => {
  const [ok, setOk] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        void navigator.clipboard?.writeText(value);
      } catch {
        /* 클립보드 미지원 환경은 무시 */
      }
      setOk(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setOk(false), 1500);
    },
    [value],
  );

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      className={cx(
        "grid h-6 w-6 flex-none cursor-pointer place-items-center rounded-[5px] border-none bg-transparent transition",
        ok ? "text-success" : "text-ink-soft hover:bg-info-weak hover:text-info",
        className,
      )}
    >
      {ok ? (
        <CheckIcon className="h-3.5 w-3.5" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5" />
      )}
    </button>
  );
};

export default CopyButton;
