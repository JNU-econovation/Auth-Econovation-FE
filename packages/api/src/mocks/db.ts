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

/**
 * 스토어에 저장되는 OAuth 클라이언트 레코드.
 *
 * 어드민이 대신 등록한 seed 클라이언트는 `ownerId`/`clientSecret`/`routeId`가 없습니다.
 * 회원이 셀프 등록(`POST /api/v1/clients`)한 클라이언트만 소유자·시크릿·연결 라우트를 가집니다.
 */
export interface ClientRecord {
  clientId: string;
  clientName: string;
  redirectUris: string[];
  /** 셀프 등록 클라이언트 소유 회원 ID. 어드민 등록 seed는 미지정. */
  ownerId?: number;
  /** 셀프 등록 시 1회 발급되는 클라이언트 시크릿. 어드민 등록 seed는 미지정. */
  clientSecret?: string;
  /** 연결된 Gateway 라우트 ID(`db.routes` 참조). 라우트 미연결 시 미지정/null. */
  routeId?: string | null;
}

/**
 * 스토어에 저장되는 Gateway 동적 라우트 레코드(`service_route`).
 *
 * 어드민이 등록한 라우트는 `ownerId`가 없고, 회원 셀프 등록 클라이언트가 함께 생성한
 * 라우트는 소유 회원 ID를 가집니다. `protected`는 삭제·수정이 금지되는 보호 경로(auth-api 핵심)입니다.
 */
export interface RouteRecord {
  routeId: string;
  pathPrefix: string;
  upstreamUrl: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  /** 셀프 등록 라우트 소유 회원 ID. 어드민 등록 seed는 미지정. */
  ownerId?: number;
  /** 보호 경로 여부(true면 수정/삭제 시 ROUTE_PROTECTED). */
  protected?: boolean;
}

interface MockDb {
  members: MemberRecord[];
  clients: ClientRecord[];
  routes: RouteRecord[];
  /** memberId 자동 증가 시퀀스. */
  memberSeq: number;
  /** clientId 생성용 시퀀스(결정적 UUID 형태 발급). */
  clientSeq: number;
  /** routeId 생성용 시퀀스(결정적 UUID 형태 발급). */
  routeSeq: number;
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
  {
    clientId: "f9e8d7c6-2b41-4c97-8d10-3a5b7c9e1f24",
    clientName: "EEOS",
    redirectUris: ["https://eeos.econo.com/auth/callback"],
  },
  {
    clientId: "3c4d5e6f-9a87-4b65-b432-1f0e9d8c7b6a",
    clientName: "출석 체크 봇",
    redirectUris: [
      "https://attend.econo.com/callback",
      "https://staging.attend.econo.com/callback",
      "http://localhost:3000/callback",
    ],
  },
];

/** seed 라우트 생성용 고정 타임스탬프(실제 시간 비의존). */
const SEED_ROUTE_TIMESTAMP = "2026-06-20T04:40:35.000Z";

/**
 * seed 라우트 목록.
 * - `/api/v1/auth`: 보호 경로(auth-api 핵심). 삭제/수정 시 ROUTE_PROTECTED.
 * - `/api/v1/board`: 일반 라우트(수정/삭제 happy path 검증용).
 */
const seedRoutes = (): RouteRecord[] => [
  {
    routeId: "550e8400-e29b-41d4-a716-446655440000",
    pathPrefix: "/api/v1/auth",
    upstreamUrl: "http://auth-api:8080",
    enabled: true,
    createdAt: SEED_ROUTE_TIMESTAMP,
    updatedAt: SEED_ROUTE_TIMESTAMP,
    protected: true,
  },
  {
    routeId: "6a1f2b3c-4d5e-6f70-8192-a3b4c5d6e7f8",
    pathPrefix: "/api/v1/board",
    upstreamUrl: "http://board-service:8080",
    enabled: true,
    createdAt: SEED_ROUTE_TIMESTAMP,
    updatedAt: SEED_ROUTE_TIMESTAMP,
  },
];

const createInitialDb = (): MockDb => ({
  members: seedMembers(),
  clients: seedClients(),
  routes: seedRoutes(),
  memberSeq: 23,
  clientSeq: 1,
  routeSeq: 1,
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
  db.routes = fresh.routes;
  db.memberSeq = fresh.memberSeq;
  db.clientSeq = fresh.clientSeq;
  db.routeSeq = fresh.routeSeq;
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
 * @description 결정적(non-random) clientSecret을 발급합니다. 셀프 등록 응답에서 1회 노출됩니다.
 */
export const nextClientSecret = (): string => {
  const seq = db.clientSeq.toString(16).padStart(24, "0");
  return `sk-mock${seq}`;
};

/**
 * @description 결정적(non-random) routeId를 발급합니다. seed UUID와 형태를 맞춥니다.
 */
export const nextRouteId = (): string => {
  db.routeSeq += 1;
  const seq = db.routeSeq.toString(16).padStart(12, "0");
  return `r0ute000-0000-4000-8000-${seq}`;
};

/**
 * @description 라우트 레코드를 셀프 클라이언트 응답용 뷰(타임스탬프·소유자 제외)로 투영합니다.
 */
export const toRouteView = (r: RouteRecord) => ({
  routeId: r.routeId,
  pathPrefix: r.pathPrefix,
  upstreamUrl: r.upstreamUrl,
  enabled: r.enabled,
});

/**
 * @description 라우트 레코드를 어드민 응답용 뷰(타임스탬프 포함, 소유자·보호 플래그 제외)로 투영합니다.
 */
export const toAdminRouteView = (r: RouteRecord) => ({
  routeId: r.routeId,
  pathPrefix: r.pathPrefix,
  upstreamUrl: r.upstreamUrl,
  enabled: r.enabled,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

/**
 * @description 클라이언트 레코드를 셀프 조회 응답용 뷰로 투영합니다(시크릿 제외, 연결 라우트 포함).
 * 연결 라우트가 없으면 `route`는 `null`입니다.
 */
export const toSelfClientView = (c: ClientRecord) => {
  const route = c.routeId
    ? db.routes.find((r) => r.routeId === c.routeId)
    : null;
  return {
    clientId: c.clientId,
    clientName: c.clientName,
    redirectUris: c.redirectUris,
    route: route ? toRouteView(route) : null,
  };
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
