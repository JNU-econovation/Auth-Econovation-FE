import { HTMLAttributes } from "react";

export type TextColor =
  | "primary"
  | "secondary"
  | "info"
  | "error"
  | "black1"
  | "black2"
  | "white1"
  | "gray1";

type TextSize = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

const COLOR_CLASS_MAP: Record<TextColor, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  info: "text-info",
  error: "text-error",
  black1: "text-main-black",
  black2: "text-secondary-black",
  white1: "text-white",
  gray1: "text-main-gray",
};

const SIZE_CLASS_MAP: Record<TextSize, string> = {
  "1": "text-3xl font-bold leading-9", // 30px - 페이지 제목
  "2": "text-2xl font-bold leading-8", // 24px - 섹션 제목
  "3": "text-xl font-semibold leading-7", // 20px - 카드 제목
  "4": "text-lg font-semibold leading-6", // 18px - 서브 헤딩
  "5": "text-base font-semibold leading-6", // 16px - 강조 본문
  "6": "text-base font-medium leading-6", // 16px - 일반 본문
  "7": "text-sm font-medium leading-5", // 14px - 보조 텍스트
  "8": "text-xs font-normal leading-4", // 12px - 캡션, 레이블
};

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  color?: TextColor;
  size?: TextSize;
}

const Text = ({ color = "primary", size = "8", ...props }: TextProps) => {
  const colorClass = COLOR_CLASS_MAP[color];
  const sizeClass = SIZE_CLASS_MAP[size];

  const classes = `${colorClass} ${sizeClass}`;

  return <p className={classes} {...props}></p>;
};

export default Text;
