/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** "true"일 때 MSW 브라우저 워커를 시작해 백엔드 없이 화면을 구동(개발 전용). */
  readonly VITE_ENABLE_MSW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
