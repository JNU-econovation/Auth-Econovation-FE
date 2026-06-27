/**
 * APP 로그인 흐름에서 SSO(web)가 콘솔 주소로 실어 보낸 토큰을 수신·보관하는 유틸.
 *
 * web의 `buildClientRedirectUrl`은 APP 클라이언트로 로그인하면 redirectUrl(=콘솔 주소)에
 * `accessToken`/`refreshToken`/`accessExpiredTime`을 같은 이름의 쿼리 파라미터로 첨부합니다.
 * 콘솔이 그 redirectUrl 대상이면, 진입 시 URL 쿼리에서 토큰을 추출해 localStorage에 저장합니다.
 *
 * 파싱(순수)과 저장·URL 정리(부수효과)를 분리해, 추출 로직을 node(unit) 환경에서 단위 테스트할
 * 수 있게 합니다(web의 `buildClientRedirectUrl`/`redirectToClient`와 동일 패턴).
 */

/** localStorage·쿼리 파라미터 공통 키. web `buildClientRedirectUrl`이 첨부하는 쿼리 키와 일치시킵니다. */
export const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
export const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";
export const ACCESS_EXPIRED_TIME_STORAGE_KEY = "accessExpiredTime";

/** redirectUrl 쿼리에서 추출한 APP 토큰. `accessToken`은 추출 트리거이므로 필수, 나머지는 있을 때만. */
export interface RedirectTokens {
  accessToken: string;
  refreshToken?: string;
  /** AT 만료 시각(epoch millis). 숫자로 파싱 가능할 때만 채워집니다. */
  accessExpiredTime?: number;
}

/**
 * @description 쿼리 문자열에서 APP 리다이렉트 토큰을 추출합니다(순수 함수, 부수효과 없음).
 *
 * `accessToken`이 없으면 APP 리다이렉트가 아니라고 보고 `null`을 반환합니다
 * (web `buildClientRedirectUrl`의 "토큰 존재 = APP 신호"와 대칭).
 *
 * @param search - `window.location.search` 형태의 쿼리 문자열(`?` 포함·미포함 모두 허용)
 * @returns 추출한 토큰, 또는 APP 리다이렉트가 아니면 `null`
 */
export function extractRedirectTokens(search: string): RedirectTokens | null {
  const params = new URLSearchParams(search);

  const accessToken = params.get(ACCESS_TOKEN_STORAGE_KEY);
  if (!accessToken) return null;

  const refreshToken = params.get(REFRESH_TOKEN_STORAGE_KEY) ?? undefined;

  const rawExpired = params.get(ACCESS_EXPIRED_TIME_STORAGE_KEY);
  const accessExpiredTime =
    rawExpired != null && rawExpired !== "" && !Number.isNaN(Number(rawExpired))
      ? Number(rawExpired)
      : undefined;

  return { accessToken, refreshToken, accessExpiredTime };
}

/**
 * @description localStorage에 저장된 액세스 토큰을 반환합니다(없으면 `null`).
 *
 * API 클라이언트의 Authorization 헤더 주입(`@auth-econovation/api`의 `setAuthTokenGetter`)에
 * 게터로 넘겨, 콘솔의 모든 요청에 토큰을 싣는 데 사용합니다.
 */
export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

/**
 * @description 추출한 APP 토큰을 localStorage에 저장합니다. 값이 없는 항목은 기록하지 않습니다.
 * @param tokens - `extractRedirectTokens`가 반환한 토큰
 */
export function storeRedirectTokens(tokens: RedirectTokens): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  if (tokens.refreshToken != null) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  }
  if (tokens.accessExpiredTime != null) {
    localStorage.setItem(
      ACCESS_EXPIRED_TIME_STORAGE_KEY,
      String(tokens.accessExpiredTime),
    );
  }
}

/**
 * @description 앱 진입 시 URL 쿼리의 APP 리다이렉트 토큰을 localStorage로 옮기고 URL에서 제거합니다.
 *
 * 콘솔이 APP 리다이렉트 대상(`/?accessToken=...&refreshToken=...&accessExpiredTime=...`)으로
 * 진입하면, 토큰을 저장한 뒤 토큰 쿼리를 제거한 URL로 히스토리 항목을 교체합니다. 이로써 토큰이
 * 주소창·뒤로가기 히스토리·(미인증 시 `redirectToLogin`이 보존하는) `returnTo`에 남지 않습니다.
 *
 * React 렌더·effect보다 먼저 1회 실행되도록 진입점(`main.tsx`)에서 호출합니다.
 * 토큰 쿼리가 없으면 아무 동작도 하지 않습니다.
 */
export function captureRedirectTokens(): void {
  const tokens = extractRedirectTokens(window.location.search);
  if (!tokens) return;

  storeRedirectTokens(tokens);

  // 토큰 쿼리만 제거(경로·해시는 보존)한 URL로 현재 히스토리 항목을 교체합니다.
  const cleanUrl = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", cleanUrl);
}
