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
} as const;
