import { parseBoolEnv, requireEnv } from "./lib/validateEnv";

/**
 * 콘솔 앱 환경변수 — 검증 + 타입 좁힘(single source of truth).
 *
 * 코드 어디서도 `import.meta.env.VITE_*`를 흩어서 읽지 않고 이 모듈을 통해서만 접근합니다.
 * 모듈 로드(부팅) 시점에 평가되므로, 필수 변수가 누락되면 앱이 잘못된 설정으로 떠버리기 전에
 * 즉시 실패합니다. (`src/main.tsx`가 부팅 초기에 import해 검증을 트리거)
 *
 * v2 기능 명세 §1 "환경 변수" 정렬. 단, SSO 인가/콜백 변수(`VITE_SSO_*`)는 SSO 연동이
 * 보류 상태이므로 연동 해제 시점에 추가합니다.
 *
 * @remarks
 * 공유 `apiClient`(`@auth-econovation/api`)는 패키지 경계상 이 모듈을 import할 수 없어
 * `VITE_API_URL`을 직접 읽습니다. 본 모듈은 동일 변수를 부팅 시점에 검증하는 책임을 집니다.
 */
export const env = {
  /** axios baseURL의 원천 변수. (`apiClient`가 동일 변수로 인스턴스를 구성) */
  apiUrl: requireEnv(import.meta.env.VITE_API_URL, "VITE_API_URL"),
  /** MSW 목 서버 구동 여부. 로컬 백엔드가 없을 때 `true`. */
  enableMsw: parseBoolEnv(import.meta.env.VITE_ENABLE_MSW),
  /**
   * 사이드바 "공식 문서" 링크가 새 탭으로 여는 docs 앱 주소.
   * dev 콘솔은 dev 문서, 운영 콘솔은 운영 문서를 가리키도록 환경별로 지정합니다.
   * 부팅 시 필수 — 누락되면 즉시 throw합니다(다른 URL 변수와 동일 규칙).
   */
  docsUrl: requireEnv(import.meta.env.VITE_DOCS_URL, "VITE_DOCS_URL"),
  /**
   * 미인증 상태에서 "로그인" 버튼이 이동할 SSO 로그인 페이지 주소.
   * 콘솔은 자체 로그인 폼 없이 이 주소로 리다이렉트만 합니다(v2 명세 §6-1).
   */
  ssoLoginUrl: requireEnv(
    import.meta.env.VITE_SSO_LOGIN_URL,
    "VITE_SSO_LOGIN_URL",
  ),
  /**
   * SSO 로그인 페이지에 전달할 콘솔의 `client-type` 쿼리 값(소문자 `web`|`app`).
   *
   * 콘솔은 인증 도메인과 다른 오리진의 SPA라 쿠키 세션을 공유받지 못합니다. 그래서
   * 로그인 후 토큰을 리다이렉트 URL 쿼리로 받는 `app` 흐름을 사용합니다
   * (`captureRedirectTokens`). 즉 운영에서도 보통 `app`입니다.
   */
  ssoClientType: requireEnv(
    import.meta.env.VITE_SSO_CLIENT_TYPE,
    "VITE_SSO_CLIENT_TYPE",
  ),
  /**
   * SSO에 콘솔을 식별시키는 `client-id`. 로그인 성공 시 백엔드가 이 값으로 콘솔의
   * 콜백 주소를 결정해 토큰과 함께 되돌려 보냅니다(`redirectToLogin`이 쿼리로 첨부).
   */
  ssoClientId: requireEnv(
    import.meta.env.VITE_SSO_CLIENT_ID,
    "VITE_SSO_CLIENT_ID",
  ),
} as const;
