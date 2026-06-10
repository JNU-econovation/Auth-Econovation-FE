/**
 * 콘솔 폼 입력 필드 className 헬퍼.
 *
 * 공유 DS의 `Input`은 레거시 토큰 기반이라(mono/error 변형 없음) 콘솔 화면 디자인
 * (식별자·URI 모노 입력, 검증 실패 강조)을 표현하지 못합니다. 콘솔 전용 입력 스타일을
 * 이 헬퍼로 일관되게 적용합니다.
 *
 * @param mono - 식별자/URI 표기용 모노 서체 적용
 * @param error - 검증 실패 강조(빨강 보더·배경)
 */
export const inputClass = ({
  mono = false,
  error = false,
}: { mono?: boolean; error?: boolean } = {}): string =>
  [
    "w-full rounded-lg border bg-input-bg px-3 py-[11px] text-sm text-ink transition",
    "placeholder:text-gray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent",
    mono ? "font-mono text-[13px]" : "",
    error ? "border-danger bg-danger-weak" : "border-border",
  ]
    .filter(Boolean)
    .join(" ");
