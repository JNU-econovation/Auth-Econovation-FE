/**
 * className 병합 유틸.
 *
 * falsy 값(false·null·undefined·"")을 제거하고 공백으로 join 합니다.
 * 조건부 클래스를 가독성 있게 조합하기 위한 의존성 없는 경량 헬퍼입니다.
 *
 * @example
 * cx("btn", isActive && "btn--active", className)
 */
export function cx(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
