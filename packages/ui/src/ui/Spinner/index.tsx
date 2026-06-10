import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";

type SpinnerProps = ComponentProps<"span">;

/**
 * 로딩 스피너. 버튼 내부 로딩 표시 등에 사용합니다.
 * 색상은 `currentColor`를 따르므로 부모의 `text-*`로 제어합니다.
 */
const Spinner = ({ className, ...props }: SpinnerProps) => (
  <span
    aria-hidden="true"
    className={cx(
      "inline-block h-[13px] w-[13px] flex-none animate-spin rounded-full border-2 border-current border-t-transparent opacity-90",
      className,
    )}
    {...props}
  />
);

export default Spinner;
