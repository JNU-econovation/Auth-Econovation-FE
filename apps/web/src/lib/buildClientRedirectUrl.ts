/**
 * 로그인/재발급 성공 후 이동할 최종 클라이언트 URL을 조립하는 순수 함수.
 *
 * `window.location` 접근(부수효과)과 분리해 두어, node(unit) 환경에서 단위 테스트할 수
 * 있습니다. 실제 이동은 `redirectToClient`이 담당합니다(`resolveDevLoginParams`와 동일 패턴).
 */

/** APP 로그인 성공 응답 바디의 토큰. WEB은 토큰을 쿠키로 받으므로 토큰이 비어 있습니다. */
export interface AppRedirectTokens {
  accessToken?: string;
  refreshToken?: string;
  /** AT 만료 시각(epoch millis). WEB 바디에도 있으나 첨부는 토큰 존재 시(APP)에만 수행합니다. */
  accessExpiredTime?: number;
}

/**
 * @description 서버가 내려준 `redirectUrl`에 APP 토큰을 쿼리로 첨부한 이동 대상 URL을 반환합니다.
 *
 * - **WEB**: 토큰을 HttpOnly 쿠키로 받으므로 응답 바디에 토큰이 없습니다. 이 경우
 *   `redirectUrl`을 그대로 반환해 기존 동작(쿠키가 따라가는 교차 출처 이동)을 유지합니다.
 * - **APP**: 응답 바디의 `accessToken`/`refreshToken`/`accessExpiredTime`을 `redirectUrl`
 *   (앱 콜백/커스텀 스킴, 예: `econoapp://callback`)에 쿼리로 실어 보내 네이티브 앱이 가로채 수신하도록 합니다.
 *
 * `redirectUrl`이 절대 URL이 아니어서 `new URL`이 실패하면(상대 경로 등) 원본을 그대로
 * 반환합니다(방어적 폴백).
 *
 * @param redirectUrl - 서버 응답의 이동 대상 URL
 * @param tokens - APP 토큰(있을 때만 첨부). WEB은 생략/빈 객체.
 */
export function buildClientRedirectUrl(
  redirectUrl: string,
  tokens?: AppRedirectTokens,
): string {
  const accessToken = tokens?.accessToken;
  const refreshToken = tokens?.refreshToken;
  const accessExpiredTime = tokens?.accessExpiredTime;
  // 첨부 트리거는 토큰 존재 여부(APP 신호). accessExpiredTime은 WEB 바디에도 있으므로 단독으론 트리거하지 않음.
  if (!accessToken && !refreshToken) return redirectUrl;

  try {
    const url = new URL(redirectUrl);
    if (accessToken) url.searchParams.set("accessToken", accessToken);
    if (refreshToken) url.searchParams.set("refreshToken", refreshToken);
    if (accessExpiredTime != null) {
      url.searchParams.set("accessExpiredTime", String(accessExpiredTime));
    }
    return url.toString();
  } catch {
    return redirectUrl;
  }
}
