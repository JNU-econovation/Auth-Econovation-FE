import { env } from "@/env";

/**
 * @description 현재 사용자를 SSO 로그인 페이지(`env.ssoLoginUrl`)로 이동시킵니다.
 *
 * 콘솔은 자체 로그인 폼이 없으므로(v2 명세 §6-1) 인증이 필요할 때 이 함수로
 * 전체 페이지 리다이렉트를 수행합니다. 로그인 후 복귀를 위해 현재 절대 경로를
 * `returnTo` 쿼리로 보존합니다(SSO 측이 지원할 경우 활용).
 *
 * 라우터 내비게이션이 아닌 `window.location` 전체 이동을 사용하는 이유:
 * 로그인 페이지는 콘솔 SPA 외부(다른 오리진)일 수 있기 때문입니다.
 */
export const redirectToLogin = (): void => {
  const returnTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;

  let target = env.ssoLoginUrl;
  try {
    const url = new URL(env.ssoLoginUrl);
    url.searchParams.set("returnTo", returnTo);
    target = url.toString();
  } catch {
    // ssoLoginUrl이 절대 URL이 아니면(상대 경로 등) 그대로 이동합니다.
  }

  window.location.assign(target);
};
