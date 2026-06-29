/**
 * @auth-econovation/ui — 공유 디자인 시스템 배럴.
 *
 * web·console 앱이 동일한 UI 프리미티브(버튼/인풋/셀렉트/텍스트)와 레이아웃
 * (ScreenWrapper/Spacing/필드 레이아웃)을 공유합니다. 소비 앱은 이 진입점에서만
 * import 하고, 디자인 토큰(색상/폰트)은 `@auth-econovation/ui/styles.css`로 주입합니다.
 */

// UI 프리미티브 (기존)
export { default as DefaultButton } from "./ui/DefaultButton";
export { default as Input } from "./ui/Input";
export { default as Select } from "./ui/Select";
export { default as Text } from "./ui/Text";
export type { TextColor } from "./ui/Text";

// UI 프리미티브 (dev-console 디자인 시스템)
export { default as Button } from "./ui/Button";
export type { ButtonVariant, ButtonSize } from "./ui/Button";
export { default as Spinner } from "./ui/Spinner";
export { default as Badge } from "./ui/Badge";
export type { BadgeVariant } from "./ui/Badge";
export { default as Banner } from "./ui/Banner";
export type { BannerKind } from "./ui/Banner";
export { default as CopyButton } from "./ui/CopyButton";
export { default as IdChip } from "./ui/IdChip";
export { default as Modal } from "./ui/Modal";
export { ToastProvider, useToast } from "./ui/Toast";
export type { ToastKind, PushToast } from "./ui/Toast";
export { default as Skeleton, TableSkeleton } from "./ui/Skeleton";
export { default as EmptyState } from "./ui/EmptyState";
export { default as ErrorState } from "./ui/ErrorState";
export { default as LogoMark } from "./ui/LogoMark";
export { default as InfoHint } from "./ui/InfoHint";

// 아이콘 (stroke 기반, currentColor)
export {
  LockIcon,
  CopyIcon,
  CheckIcon,
  WarnIcon,
  ChevronDownIcon,
  UsersIcon,
  GridIcon,
  InfoIcon,
  BookIcon,
} from "./icons";

// 레이아웃
export { default as ScreenWrapper } from "./layout/ScreenWrapper";
export { default as Spacing } from "./layout/Spacing";
export { default as SelectFieldLayout } from "./layout/SelectFieldLayout";
export { default as TextFieldLayout } from "./layout/TextFieldLayout";
export { default as Card, CardHeader, CardBody } from "./layout/Card";
