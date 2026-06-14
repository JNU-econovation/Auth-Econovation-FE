/**
 * web 앱 환경변수 접근 지점(single source of truth).
 *
 * 코드 곳곳에서 `import.meta.env.VITE_*`를 흩어 읽지 않고 이 모듈을 통해서만 접근합니다.
 *
 * 운영에서는 외부 서비스가 SSO 로그인('/')으로 진입시킬 때 `client-id`/`client-type`
 * 등을 쿼리로 전달합니다. 반면 로컬 개발에서는 '/'로 바로 들어와 그 쿼리가 비어 있으므로,
 * 아래 `dev*` 기본값으로 누락 쿼리를 자동 보정(`useDevLoginParams`)해 로그인 흐름을
 * 그대로 시연할 수 있게 합니다. 이 값들은 개발 모드(`isDev`)에서만 쓰이며 운영 빌드에선 무시됩니다.
 */
export const env = {
  /** Vite dev 모드 여부. 운영 빌드에서는 false. */
  isDev: import.meta.env.DEV,
  /** 개발용 OAuth client-id (`.env`의 VITE_DEV_CLIENT_ID). 로그인 body의 `clientId`로 전송. */
  devClientId: import.meta.env.VITE_DEV_CLIENT_ID ?? "",
  /** 개발용 client-type. 미설정 시 "WEB". */
  devClientType: import.meta.env.VITE_DEV_CLIENT_TYPE ?? "WEB",
} as const;
