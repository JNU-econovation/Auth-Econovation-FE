/**
 * SSO 로그인 페이지로 이동할 최종 URL을 조립하는 순수 함수.
 *
 * `window.location` 접근·이동(부수효과)과 분리해 두어, node(unit) 환경에서 단위 테스트할 수
 * 있습니다. 실제 이동은 `redirectToLogin`이 담당합니다
 * (web의 `buildClientRedirectUrl`, console의 `extractRedirectTokens`와 동일 패턴).
 */

/** 로그인 페이지(web)가 읽는 식별 쿼리. SSO 로그인 페이지가 읽는 키와 정확히 일치시킵니다(소문자 kebab-case). */
export interface LoginQuery {
  /** 콘솔의 client-type(소문자 `web`|`app`). 토큰을 URL 쿼리로 받는 콘솔은 보통 `app`. */
  clientType: string;
  /** SSO에 콘솔을 식별시키는 OAuth client-id. */
  clientId: string;
}

/**
 * @description 로그인 페이지 주소에 `client-type`/`client-id`를 쿼리로 첨부한 이동 대상 URL을 반환합니다.
 *
 * `searchParams.set`을 쓰므로 `loginUrl`에 같은 키가 이미 있으면 인자 값으로 덮어씁니다.
 * 그 외 기존 쿼리(다른 키)는 보존합니다.
 *
 * `loginUrl`이 절대 URL이 아니어서 `new URL`이 실패하면(상대 경로 등) 쿼리를 붙이지 못하므로
 * 원본을 그대로 반환합니다(방어적 폴백).
 *
 * @param loginUrl - SSO 로그인 페이지 주소(`env.ssoLoginUrl`)
 * @param query - 첨부할 식별 쿼리
 */
export function buildLoginUrl(loginUrl: string, query: LoginQuery): string {
  try {
    const url = new URL(loginUrl);
    // 로그인 페이지(web)가 읽는 키와 정확히 일치시킵니다(소문자 kebab-case).
    url.searchParams.set("client-type", query.clientType);
    url.searchParams.set("client-id", query.clientId);
    return url.toString();
  } catch {
    return loginUrl;
  }
}
