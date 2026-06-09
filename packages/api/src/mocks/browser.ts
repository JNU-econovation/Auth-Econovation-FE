import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * 브라우저(개발 런타임)용 MSW 워커 인스턴스.
 *
 * 실제 백엔드 없이 SSO 화면을 구동/시연할 때 사용합니다. 시작은
 * `src/main.tsx`에서 `VITE_ENABLE_MSW` 플래그가 켜진 경우에만 수행하며,
 * 테스트(node)용 인스턴스는 `./server`에 별도로 있습니다.
 *
 * 워커 스크립트(`public/mockServiceWorker.js`)는 `msw init public`으로 생성됩니다.
 */
export const worker = setupWorker(...handlers);
