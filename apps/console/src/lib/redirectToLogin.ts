import { env } from "@/env";
import { buildLoginUrl } from "@/lib/buildLoginUrl";

/**
 * @description 현재 사용자를 SSO 로그인 페이지(`env.ssoLoginUrl`)로 이동시킵니다.
 *
 * 콘솔은 자체 로그인 폼이 없으므로(v2 명세 §6-1) 인증이 필요할 때 이 함수로
 * 전체 페이지 리다이렉트를 수행합니다.
 *
 * SSO 로그인 페이지가 읽는 클라이언트 식별 쿼리(`client-type`/`client-id`, kebab-case)를
 * `env`에서 읽어 첨부합니다. 이 값이 없으면 로그인 페이지가 클라이언트를 식별하지 못해
 * 로그인 후 엉뚱한 곳으로 되돌아갑니다. 추가로 현재 절대 경로를 `returnTo`로 보존합니다
 * (SSO 측이 지원할 경우 활용).
 *
 * URL 조립은 순수 함수 `buildLoginUrl`에 위임하고(node 단위 테스트 대상), 이 함수는
 * `window.location` 읽기·이동(부수효과)만 담당합니다.
 *
 * 라우터 내비게이션이 아닌 `window.location` 전체 이동을 사용하는 이유:
 * 로그인 페이지는 콘솔 SPA 외부(다른 오리진)일 수 있기 때문입니다.
 */
export const redirectToLogin = (): void => {
  const returnTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;

  const target = buildLoginUrl(env.ssoLoginUrl, {
    clientType: env.ssoClientType,
    clientId: env.ssoClientId,
    returnTo,
  });

  window.location.assign(target);
};
