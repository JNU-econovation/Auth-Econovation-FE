import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { db } from "./db";

/**
 * 브라우저(개발 런타임) 전용 seed 보강.
 *
 * `GET /api/v1/clients`는 요청자(actor) **본인 소유** 클라이언트만 반환하는데, db의 seed
 * 클라이언트는 어드민 대신 등록분이라 `ownerId`가 없어 셀프 목록이 비어 보입니다. 개발 화면에서
 * 목록을 바로 확인할 수 있도록, 소유자 없는 seed를 기본 actor(헤더 미전송 시 memberId 1)
 * 소유로 지정해 둡니다. 테스트(node)는 `./server`를 쓰고 이 모듈을 로드하지 않으므로 영향받지
 * 않습니다.
 */
const DEV_ACTOR_MEMBER_ID = 1;
db.clients = db.clients.map((c) =>
  c.ownerId === undefined ? { ...c, ownerId: DEV_ACTOR_MEMBER_ID } : c,
);

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
