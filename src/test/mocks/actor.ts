import type { Role } from "./db";
import { MOCK_MEMBER_ID_HEADER, MOCK_ROLE_HEADER } from "./constants";

/**
 * 요청자(actor) 신원 추출 및 역할 비교 유틸.
 *
 * 모킹 환경에는 JWT 검증이 없으므로 `X-Mock-Role` / `X-Mock-Member-Id` 헤더로
 * 요청자 신원을 주입합니다. 헤더가 없으면 권한이 충족된 상태(SUPER_ADMIN, id 1)를
 * 기본값으로 사용해 happy path가 별도 설정 없이 동작하도록 합니다.
 */

const ROLE_RANK: Record<Role, number> = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

const isRole = (value: string): value is Role =>
  value === "USER" || value === "ADMIN" || value === "SUPER_ADMIN";

/**
 * @description 요청 헤더에서 요청자 역할을 읽습니다(미지정 시 `SUPER_ADMIN`).
 *
 * ⚠️ 헤더 부재 시 최고 권한으로 폴백하는 것은 **happy path 편의를 위한 모킹 전용** 동작입니다.
 * 권한 회귀(예: 어드민 UI가 인증을 누락한 채 보호 엔드포인트를 호출)는 이 핸들러로 잡히지
 * 않으므로, 권한 거부(403) 케이스를 테스트할 때는 반드시 `X-Mock-Role`을 명시하세요.
 */
export const getActorRole = (request: Request): Role => {
  const raw = request.headers.get(MOCK_ROLE_HEADER)?.toUpperCase() ?? "";
  return isRole(raw) ? raw : "SUPER_ADMIN";
};

/** @description 요청 헤더에서 요청자 회원 ID를 읽습니다(미지정 시 `1`). */
export const getActorMemberId = (request: Request): number => {
  const raw = request.headers.get(MOCK_MEMBER_ID_HEADER);
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

/** @description 요청자 역할이 `required` 이상인지 검사합니다. */
export const hasRoleAtLeast = (actor: Role, required: Role): boolean =>
  ROLE_RANK[actor] >= ROLE_RANK[required];
