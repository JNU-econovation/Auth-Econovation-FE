import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";

export type BadgeVariant = "super" | "admin" | "user" | "me";

interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  super: "px-2 py-0.5 text-[11px] bg-ink text-white",
  admin: "px-2 py-0.5 text-[11px] bg-accent-weak text-accent",
  user: "px-2 py-0.5 text-[11px] bg-bg-sunken text-ink-soft",
  me: "px-1.5 text-[10px] border border-accent text-accent",
};

/**
 * 상태/역할 표기용 배지.
 * 역할 매핑(SUPER_ADMIN→super 등)은 도메인 레이어(소비 앱)에서 수행합니다.
 */
const Badge = ({ variant = "user", className, children, ...props }: BadgeProps) => (
  <span
    className={cx(
      "inline-flex items-center whitespace-nowrap rounded-md font-semibold leading-4 tracking-[0.03em]",
      VARIANT_CLASS[variant],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
