import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

interface EmptyStateProps {
  title: ReactNode;
  desc?: ReactNode;
  /** 하단 액션(버튼 등) */
  action?: ReactNode;
  className?: string;
}

/**
 * 데이터 없음 안내 블록.
 */
const EmptyState = ({ title, desc, action, className }: EmptyStateProps) => (
  <div className={cx("px-6 py-12 text-center", className)}>
    <h3 className="mb-2 text-base font-semibold leading-6">{title}</h3>
    {desc ? <p className="mb-4 text-ink-soft">{desc}</p> : null}
    {action}
  </div>
);

export default EmptyState;
