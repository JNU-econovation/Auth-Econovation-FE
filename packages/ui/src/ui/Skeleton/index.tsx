import type { CSSProperties } from "react";
import { cx } from "../../lib/cx";

interface SkeletonProps {
  /** 폭(px 숫자 또는 CSS 길이 문자열) */
  w?: number | string;
  /** 높이(px 숫자 또는 CSS 길이 문자열) */
  h?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * 로딩 자리표시(shimmer) 블록.
 */
const Skeleton = ({ w = "100%", h = 14, className, style }: SkeletonProps) => (
  <span
    className={cx(
      "relative block overflow-hidden rounded-md bg-bg-sunken",
      className,
    )}
    style={{ width: w, height: h, ...style }}
  >
    <span
      aria-hidden="true"
      className="absolute inset-0 animate-shimmer motion-reduce:animate-none"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
      }}
    />
  </span>
);

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

/**
 * 테이블 형태 로딩 자리표시.
 */
export const TableSkeleton = ({ rows = 3, cols = 3 }: TableSkeletonProps) => (
  <table className="w-full border-collapse">
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="border-b border-border px-4 py-3">
              <Skeleton w={c === 0 ? "60%" : "80%"} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Skeleton;
