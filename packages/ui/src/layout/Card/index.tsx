import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../lib/cx";

/**
 * 콘텐츠 카드 컨테이너. 헤더/본문은 `CardHeader`·`CardBody`로 구성합니다.
 */
const Card = ({ className, children, ...props }: ComponentProps<"div">) => (
  <div
    className={cx("rounded-xl border border-border bg-white", className)}
    {...props}
  >
    {children}
  </div>
);

interface CardHeaderProps {
  children: ReactNode;
  /** 우측 액션 영역(버튼 등) */
  actions?: ReactNode;
  className?: string;
}

/** 카드 헤더: 좌측 제목 + 우측 액션, 하단 구분선. */
export const CardHeader = ({ children, actions, className }: CardHeaderProps) => (
  <div
    className={cx(
      "flex items-center justify-between gap-4 border-b border-border px-6 py-4",
      className,
    )}
  >
    <h2 className="text-base font-semibold leading-6">{children}</h2>
    {actions}
  </div>
);

/** 카드 본문: 표준 패딩(24px). */
export const CardBody = ({
  className,
  children,
  ...props
}: ComponentProps<"div">) => (
  <div className={cx("p-6", className)} {...props}>
    {children}
  </div>
);

export default Card;
