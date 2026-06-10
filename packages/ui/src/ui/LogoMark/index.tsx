import type { CSSProperties } from "react";
import { cx } from "../../lib/cx";

interface LogoMarkProps {
  /** 한 변 크기(px). 미지정 시 28px */
  size?: number;
  className?: string;
}

/**
 * 에코노베이션 로고 마크("EC"). 사이드바·로그인 화면 등에서 사용합니다.
 */
const LogoMark = ({ size, className }: LogoMarkProps) => {
  const style: CSSProperties | undefined = size
    ? { width: size, height: size }
    : undefined;
  return (
    <span
      style={style}
      className={cx(
        "grid h-7 w-7 flex-none place-items-center rounded-[7px] bg-accent font-mono text-xs font-bold tracking-[-0.02em] text-white",
        className,
      )}
    >
      EC
    </span>
  );
};

export default LogoMark;
