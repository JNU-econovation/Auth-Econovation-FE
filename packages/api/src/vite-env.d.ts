/**
 * 소비 앱(Vite)이 빌드 시 주입하는 `import.meta.env.VITE_API_URL` 타입 선언.
 * packages/api 단독 타입체크(tsc) 시에도 `client.ts`가 컴파일되도록 최소 선언만 둡니다.
 * (각 앱은 자체 `vite-env.d.ts`로 동일 인터페이스를 보강하지만, 별도 컴파일 단위라 충돌 없음)
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** "true"일 때 MSW 브라우저 워커를 시작해 백엔드 없이 화면을 구동(개발 전용). */
  readonly VITE_ENABLE_MSW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
