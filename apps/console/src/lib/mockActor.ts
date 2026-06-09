import { apiClient } from "@auth-econovation/api";
import type { AdminRole } from "@auth-econovation/api/admin";

/**
 * 개발(MSW) 전용 — 요청자(actor) 역할 store + apiClient 헤더 주입 인터셉터.
 *
 * React 비의존 순수 로직입니다(Context/Provider는 `./mockRole` 참조). 실제 백엔드는
 * 로그인 쿠키(JWT)에서 역할/회원ID를 추출하지만, 로컬 개발은 MSW 목으로 구동되므로
 * `X-Mock-Role`/`X-Mock-Member-Id` 헤더로 요청자 신원을 주입합니다.
 *
 * ⚠️ 프로덕션에서는 인터셉터를 설치하지 않으며(헤더 미주입), 역할은 세션 쿠키로 결정됩니다.
 */

/** 모킹 seed 기준 역할별 대표 회원 ID(본인 역할 변경 차단 케이스 정합성용). */
const MEMBER_ID_BY_ROLE: Record<AdminRole, number> = {
  SUPER_ADMIN: 1, // seed: honggildong
  ADMIN: 2, // seed: ecokim
  USER: 3, // seed: member3
};

let currentRole: AdminRole = "SUPER_ADMIN";
let currentMemberId = MEMBER_ID_BY_ROLE.SUPER_ADMIN;

/** @description 모듈 store의 actor 역할을 설정합니다(인터셉터/Provider 공용). */
export const setMockActorRole = (role: AdminRole): void => {
  currentRole = role;
  currentMemberId = MEMBER_ID_BY_ROLE[role];
};

/** @description 현재 actor 역할을 반환합니다. */
export const getMockActorRole = (): AdminRole => currentRole;

/** @description 개발(MSW) 모드 여부. 역할 전환 UI 노출/인터셉터 설치 판단에 사용. */
export const isMockEnabled = (): boolean =>
  import.meta.env.VITE_ENABLE_MSW === "true";

let interceptorId: number | null = null;

/**
 * @description 공유 apiClient에 X-Mock-Role/X-Mock-Member-Id 헤더 주입 인터셉터를 1회 설치합니다.
 * 개발(MSW) 런타임과 통합 테스트에서만 호출합니다.
 */
export const installMockRoleInterceptor = (): void => {
  if (interceptorId !== null) return;
  interceptorId = apiClient.interceptors.request.use((config) => {
    config.headers.set("X-Mock-Role", currentRole);
    config.headers.set("X-Mock-Member-Id", String(currentMemberId));
    return config;
  });
};
