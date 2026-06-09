/**
 * @auth-econovation/ui — 공유 디자인 시스템 배럴.
 *
 * web·console 앱이 동일한 UI 프리미티브(버튼/인풋/셀렉트/텍스트)와 레이아웃
 * (ScreenWrapper/Spacing/필드 레이아웃)을 공유합니다. 소비 앱은 이 진입점에서만
 * import 하고, 디자인 토큰(색상/폰트)은 `@auth-econovation/ui/styles.css`로 주입합니다.
 */

// UI 프리미티브
export { default as DefaultButton } from "./ui/DefaultButton";
export { default as Input } from "./ui/Input";
export { default as Select } from "./ui/Select";
export { default as Text } from "./ui/Text";
export type { TextColor } from "./ui/Text";

// 레이아웃
export { default as ScreenWrapper } from "./layout/ScreenWrapper";
export { default as Spacing } from "./layout/Spacing";
export { default as SelectFieldLayout } from "./layout/SelectFieldLayout";
export { default as TextFieldLayout } from "./layout/TextFieldLayout";
