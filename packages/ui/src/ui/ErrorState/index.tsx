import Button from "../Button";

interface ErrorStateProps {
  onRetry?: () => void;
  /** 하단에 표기할 에러 코드 */
  errorCode?: string;
  title?: string;
  desc?: string;
}

/**
 * 목록/데이터 로드 실패 안내 블록. 재시도 버튼과 에러 코드를 표시합니다.
 */
const ErrorState = ({
  onRetry,
  errorCode = "INTERNAL_SERVER_ERROR",
  title = "목록을 불러오지 못했습니다",
  desc = "잠시 후 다시 시도해 주세요.",
}: ErrorStateProps) => (
  <div className="px-6 py-12 text-center">
    <h3 className="mb-2 text-base font-semibold leading-6">{title}</h3>
    <p className="mb-4 text-ink-soft">{desc}</p>
    {onRetry ? (
      <Button variant="secondary" onClick={onRetry}>
        다시 시도
      </Button>
    ) : null}
    <div className="mt-3 font-mono text-xs text-ink-soft">{errorCode}</div>
  </div>
);

export default ErrorState;
