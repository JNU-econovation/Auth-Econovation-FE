import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import Spinner from "../Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "ghost-danger"
  | "ghost-plain";

export type ButtonSize = "md" | "sm";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** true면 스피너를 표시하고 버튼을 비활성화합니다. */
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-accent text-white enabled:hover:brightness-[0.96]",
  secondary:
    "border-border bg-white text-ink enabled:hover:bg-bg-sunken",
  danger:
    "border-transparent bg-danger text-white enabled:hover:brightness-[0.96]",
  ghost:
    "border-transparent bg-transparent text-info enabled:hover:bg-info-weak",
  "ghost-danger":
    "border-transparent bg-transparent text-danger enabled:hover:bg-danger-weak",
  "ghost-plain":
    "border-transparent bg-transparent text-ink-soft enabled:hover:bg-bg-sunken enabled:hover:text-ink",
};

const VARIANT_PADDING: Record<ButtonVariant, string> = {
  primary: "px-5 py-2.5",
  secondary: "px-5 py-2.5",
  danger: "px-5 py-2.5",
  ghost: "px-3 py-2.5",
  "ghost-danger": "px-2.5 py-1.5",
  "ghost-plain": "px-2.5 py-1.5",
};

/**
 * 디자인 시스템 버튼. 변형(variant)·크기(size)·로딩 상태를 지원합니다.
 *
 * 기존 `DefaultButton`(title prop 기반)과 별개의 신규 컴포넌트로, 콘솔 등
 * 풍부한 액션 표현이 필요한 화면에서 사용합니다.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  const padding = size === "sm" ? "px-2.5 py-[5px]" : VARIANT_PADDING[variant];
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <button
      ref={ref}
      disabled={loading || disabled}
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        textSize,
        padding,
        VARIANT_CLASS[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

export default Button;
