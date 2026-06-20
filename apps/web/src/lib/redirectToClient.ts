import {
  buildClientRedirectUrl,
  type AppRedirectTokens,
} from "./buildClientRedirectUrl";

/**
 * @description 로그인/재발급 성공 후 서버가 내려준 `redirectUrl`로 전체 페이지를 이동시킵니다.
 *
 * 로그인 성공 응답 바디의 `redirectUrl`은 SSO 진입을 요청한 OAuth 클라이언트의
 * 콜백/복귀 주소(예: `https://app.econo.com/callback`)로, 대개 SSO 페이지와 **다른 오리진**입니다.
 * 따라서 라우터 내비게이션이 아닌 `window.location` 전체 이동을 사용합니다
 * (콘솔의 `redirectToLogin`과 동일한 교차 출처 이동 전략).
 *
 * **WEB/APP 토큰 전달 차이**:
 * - WEB: AT/RT를 HttpOnly 쿠키로 받으므로 바디에 토큰이 없고, `redirectUrl`로 그대로 이동하면
 *   브라우저 쿠키가 함께 전달됩니다.
 * - APP: 바디의 `accessToken`/`refreshToken`/`accessExpiredTime`을 `tokens`로 넘기면 `redirectUrl`에
 *   쿼리로 첨부해 네이티브 앱(웹뷰)이 가로채 수신하도록 합니다. (URL 조립은 `buildClientRedirectUrl` 참조)
 *
 * @param redirectUrl - 서버 응답의 이동 대상 URL
 * @param tokens - APP 토큰(있을 때만 쿼리로 첨부). WEB은 생략/빈 객체.
 */
export const redirectToClient = (
  redirectUrl: string,
  tokens?: AppRedirectTokens,
): void => {
  window.location.assign(buildClientRedirectUrl(redirectUrl, tokens));
};
