import type { ActiveStatus } from "../auth/types";

/**
 * MSW용 인메모리 stateful 스토어.
 *
 * 회원가입/로그인/클라이언트 등록/역할 변경 등 상태 변경 엔드포인트가 일관된
 * 데이터를 공유하도록 단일 스토어를 둡니다. 테스트 간 격리를 위해 각 테스트 후
 * `resetDb()`로 seed 상태로 되돌립니다(`src/test/setup.ts`에서 호출).
 */

/** SSO 백엔드 역할. */
export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

/** 스토어에 저장되는 회원 레코드(모킹 전용으로 password를 함께 보관). */
export interface MemberRecord {
  memberId: number;
  name: string;
  loginId: string;
  password: string;
  generation: number;
  status: ActiveStatus;
  role: Role;
}

/** 스토어에 저장되는 OAuth 클라이언트 레코드. */
export interface ClientRecord {
  clientId: string;
  clientName: string;
  redirectUris: string[];
}

interface MockDb {
  members: MemberRecord[];
  clients: ClientRecord[];
  /** memberId 자동 증가 시퀀스. */
  memberSeq: number;
  /** clientId 생성용 시퀀스(결정적 UUID 형태 발급). */
  clientSeq: number;
  /**
   * 무효화된 Refresh Token 집합. WEB 로그아웃 시 서버가 RT를 만료시키는 동작을
   * 모킹하기 위한 것으로, reissue는 이 집합에 포함된 RT를 401로 거부합니다.
   * (로그아웃 → 재발급 401 → 로그인 페이지 흐름을 테스트할 수 있게 함)
   */
  revokedRefreshTokens: Set<string>;
}

const STATUSES: ActiveStatus[] = ["AM", "RM", "CM", "OB"];

/**
 * seed 회원 목록. 페이지네이션(기본 size 20) 검증이 가능하도록 23명을 생성합니다.
 * - memberId 1: 유일한 SUPER_ADMIN (역할 변경/마지막 슈퍼어드민 케이스의 기준)
 * - memberId 2: ADMIN
 * - 나머지: USER
 * 모든 seed 계정의 비밀번호는 `Econo1234!`로 통일합니다.
 */
const seedMembers = (): MemberRecord[] => {
  const named: MemberRecord[] = [
    {
      memberId: 1,
      name: "홍길동",
      loginId: "honggildong",
      password: "Econo1234!",
      generation: 30,
      status: "AM",
      role: "SUPER_ADMIN",
    },
    {
      memberId: 2,
      name: "김에코",
      loginId: "ecokim",
      password: "Econo1234!",
      generation: 31,
      status: "AM",
      role: "ADMIN",
    },
  ];

  const filler: MemberRecord[] = Array.from({ length: 21 }, (_, i) => {
    const memberId = i + 3;
    return {
      memberId,
      name: `회원${memberId}`,
      loginId: `member${memberId}`,
      password: "Econo1234!",
      generation: 30 + (i % 5),
      status: STATUSES[i % STATUSES.length],
      role: "USER" as const,
    };
  });

  return [...named, ...filler];
};

const seedClients = (): ClientRecord[] => [
  {
    clientId: "a1b2c3d4-1234-5678-9abc-def012345678",
    clientName: "ECONO SPA",
    redirectUris: ["https://app.econo.com/callback"],
  },
];

const createInitialDb = (): MockDb => ({
  members: seedMembers(),
  clients: seedClients(),
  memberSeq: 23,
  clientSeq: 1,
  revokedRefreshTokens: new Set<string>(),
});

/** 현재 스토어 인스턴스. 핸들러는 이 객체를 통해서만 상태에 접근합니다. */
export const db: MockDb = createInitialDb();

/**
 * @description 스토어를 seed 상태로 초기화합니다. 테스트 간 격리를 위해 각 테스트 후 호출합니다.
 */
export const resetDb = (): void => {
  const fresh = createInitialDb();
  db.members = fresh.members;
  db.clients = fresh.clients;
  db.memberSeq = fresh.memberSeq;
  db.clientSeq = fresh.clientSeq;
  db.revokedRefreshTokens = fresh.revokedRefreshTokens;
};

/**
 * @description 결정적(non-random) clientId를 발급합니다. seed UUID와 형태를 맞춥니다.
 */
export const nextClientId = (): string => {
  db.clientSeq += 1;
  const seq = db.clientSeq.toString(16).padStart(12, "0");
  return `c1ient00-0000-4000-8000-${seq}`;
};

/**
 * @description 어드민 회원 목록용 투영(role 포함, password 제외).
 */
export const toAdminMemberView = (m: MemberRecord) => ({
  memberId: m.memberId,
  name: m.name,
  loginId: m.loginId,
  generation: m.generation,
  status: m.status,
  role: m.role,
});

/**
 * @description 외부 연동 회원 조회(`/members/batch`)용 투영(role/password 제외).
 */
export const toPublicMemberView = (m: MemberRecord) => ({
  memberId: m.memberId,
  name: m.name,
  loginId: m.loginId,
  generation: m.generation,
  status: m.status,
});
