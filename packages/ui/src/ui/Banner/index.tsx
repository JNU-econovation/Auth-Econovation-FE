import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { WarnIcon } from "../../icons";

export type BannerKind = "warning" | "danger";

interface BannerProps {
  kind?: BannerKind;
  children: ReactNode;
  className?: string;
}

const KIND_CLASS: Record<BannerKind, string> = {
  warning: "bg-warning-weak text-[#6e4a05]",
  danger: "bg-danger-weak text-[#8c2018]",
};

const ICON_CLASS: Record<BannerKind, string> = {
  warning: "text-warning",
  danger: "text-danger",
};

/**
 * 인라인 경고/위험 안내 배너.
 */
const Banner = ({ kind = "warning", children, className }: BannerProps) => (
  <div
    className={cx(
      "flex items-start gap-3 rounded-lg px-4 py-3 text-sm leading-[22px]",
      KIND_CLASS[kind],
      className,
    )}
  >
    <WarnIcon className={cx("mt-[3px] h-4 w-4 flex-none", ICON_CLASS[kind])} />
    <div>{children}</div>
  </div>
);

export default Banner;
