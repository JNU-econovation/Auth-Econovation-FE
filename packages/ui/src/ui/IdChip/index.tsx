import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import CopyButton from "../CopyButton";

interface IdChipProps {
  /** 실제 값(복사 대상이자 title) */
  value: string;
  /** 표시 텍스트(미지정 시 value) */
  display?: ReactNode;
  /** 배경/보더 없는 형태 */
  bare?: boolean;
  /** 복사 버튼 표시 여부 */
  copy?: boolean;
  className?: string;
}

/**
 * 식별자(클라이언트 ID·토큰 등) 표기용 모노 칩. 말줄임 + 선택적 복사 버튼.
 */
const IdChip = ({
  value,
  display,
  bare = false,
  copy = true,
  className,
}: IdChipProps) => (
  <span
    className={cx(
      "inline-flex max-w-full items-center gap-1 rounded-md font-mono text-[13px] leading-5",
      bare
        ? "py-[3px] pr-1 pl-0"
        : "border border-border bg-bg-sunken py-[3px] pr-1 pl-[9px]",
      className,
    )}
  >
    <span
      className="overflow-hidden text-ellipsis whitespace-nowrap"
      title={value}
    >
      {display ?? value}
    </span>
    {copy ? <CopyButton value={value} /> : null}
  </span>
);

export default IdChip;
