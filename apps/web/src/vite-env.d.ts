/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** "true"일 때 MSW 브라우저 워커를 시작해 백엔드 없이 화면을 구동(개발 전용). */
  readonly VITE_ENABLE_MSW?: string;
  /** 개발 모드에서 '/' 진입 시 자동으로 채울 로그인 쿼리 기본값(운영 빌드 미사용). */
  readonly VITE_DEV_CLIENT_ID?: string;
  readonly VITE_DEV_CLIENT_TYPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
