import { http, HttpResponse } from "msw";
import type {
  ReissueRequest,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
} from "../auth/types";
import {
  MOCK_ACCESS_EXPIRED_TIME,
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN,
  ME_API_PATH,
  REISSUE_API_PATH,
  SIGN_IN_API_PATH,
  SIGN_UP_API_PATH,
  LOGOUT_API_PATH,
} from "./constants";
import { getActorMemberId } from "./actor";
import { db, toAdminMemberView } from "./db";
import { errorResponse } from "./errors";

/**
 * 그룹 1. 인증 흐름 핸들러 (`context/sso-api/frontend-auth.md`).
 *
 * SSO 로그인 화면이 직접 호출하는 signup / login / reissue / logout.
 * `Client-Type` 헤더(WEB 기본 / APP)에 따라 토큰을 쿠키로 줄지 바디로 줄지 분기합니다.
 *
 * ⚠️ 이는 `frontend-auth.md` 기준 **SSO 페이지 내부 인증 흐름**(옛 `Client-Type` 분기 포함)을
 * 그대로 모킹한 것입니다. CLAUDE.md의 "단일 진실"인 외부 임시 토큰 교환 흐름
 * (`/token/exchange`, `/token/refresh`)과는 **무관**하며, 그 교환 엔드포인트는 SSO 백엔드가
 * 직접 제공하므로 본 프론트 코드/모킹에서 다루지 않습니다. 둘을 혼동하지 마세요.
 */

const LOGIN_ID_PATTERN = /^[a-zA-Z0-9._-]{3,19}$/;
const STATUSES = new Set(["AM", "RM", "CM", "OB"]);

/** WEB 로그인/재발급 시 발급할 HttpOnly 쿠키 헤더(at, rt)를 구성합니다. */
const tokenCookieHeaders = (): Headers => {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `at=${MOCK_ACCESS_TOKEN}; Path=/; HttpOnly; SameSite=Lax`,
  );
  headers.append(
    "Set-Cookie",
    `rt=${MOCK_REFRESH_TOKEN}; Path=/; HttpOnly; SameSite=Lax`,
  );
  return headers;
};

const isWeb = (request: Request): boolean =>
  (request.headers.get("Client-Type") ?? "WEB").toUpperCase() !== "APP";

/** APP 응답 바디(토큰 포함). */
const appTokenBody: SignInResponse = {
  accessToken: MOCK_ACCESS_TOKEN,
  accessExpiredTime: MOCK_ACCESS_EXPIRED_TIME,
  refreshToken: MOCK_REFRESH_TOKEN,
};

/** WEB 응답 바디(만료 시각만). */
const webTokenBody: SignInResponse = {
  accessExpiredTime: MOCK_ACCESS_EXPIRED_TIME,
};

export const authHandlers = [
  /**
   * GET /api/v1/auth/me — 현재 로그인 사용자 조회(인증 가드의 기준 호출).
   *
   * 실제 백엔드는 AT 쿠키(JWT)에서 신원을 추출하지만, 모킹 환경엔 JWT 검증이 없으므로
   * `X-Mock-Member-Id` 헤더(미지정 시 1)로 요청자를 식별합니다(`./actor` 폴백 철학).
   * 폴백 덕에 happy path는 인증된 SUPER_ADMIN으로 동작하며, 미인증(401) 케이스는
   * 테스트에서 `server.use(...)`로 이 핸들러를 덮어써 시뮬레이션합니다.
   */
  http.get(`*${ME_API_PATH}`, ({ request }) => {
    const memberId = getActorMemberId(request);
    const member = db.members.find((m) => m.memberId === memberId);
    if (!member) {
      return errorResponse("INVALID_CREDENTIALS");
    }
    return HttpResponse.json(toAdminMemberView(member));
  }),

  /**
   * POST /api/v1/auth/signup — 회원 가입.
   * 201(바디 없음) / 400 VALIDATION_FAILED·INVALID_PASSWORD_POLICY / 409 MEMBER_ALREADY_EXISTS.
   * 성공 시 토큰을 발급하지 않으며, 스토어에 USER 역할로 회원을 추가합니다.
   */
  http.post(`*${SIGN_UP_API_PATH}`, async ({ request }) => {
    let body: Partial<SignUpRequest>;
    try {
      body = (await request.json()) as Partial<SignUpRequest>;
    } catch {
      return errorResponse("VALIDATION_FAILED");
    }

    const { name, loginId, password, generation, status } = body;

    // 1) 형식/필수 검증 (비밀번호 정책 제외)
    const nameValid =
      typeof name === "string" && name.length >= 1 && name.length <= 50;
    const loginIdValid =
      typeof loginId === "string" && LOGIN_ID_PATTERN.test(loginId);
    const generationValid =
      typeof generation === "number" &&
      Number.isInteger(generation) &&
      generation >= 1 &&
      generation <= 99;
    const statusValid = typeof status === "string" && STATUSES.has(status);
    const passwordPresent = typeof password === "string";

    if (
      !nameValid ||
      !loginIdValid ||
      !generationValid ||
      !statusValid ||
      !passwordPresent
    ) {
      return errorResponse("VALIDATION_FAILED");
    }

    // 2) 비밀번호 정책 (8~19자)
    if (password.length < 8 || password.length > 19) {
      return errorResponse("INVALID_PASSWORD_POLICY");
    }

    // 3) loginId 중복
    if (db.members.some((m) => m.loginId === loginId)) {
      return errorResponse("MEMBER_ALREADY_EXISTS");
    }

    db.memberSeq += 1;
    db.members = [
      ...db.members,
      {
        memberId: db.memberSeq,
        name,
        loginId,
        password,
        generation,
        status,
        role: "USER",
      },
    ];

    // 명세상 성공 응답은 바디 없는 201.
    return new HttpResponse(null, { status: 201 });
  }),

  /**
   * POST /api/v1/auth/login — 로그인.
   * 200(WEB: 쿠키+만료시각 / APP: 토큰 바디) / 401 INVALID_CREDENTIALS.
   *
   * 요청 바디는 `{ loginId, password, clientId }`입니다. `clientId`는 SSO 진입 시
   * `client-id` 쿼리로 전달돼 어느 OAuth 클라이언트에서 온 로그인인지 식별하는 값으로,
   * 모킹 단계에서는 수신만 하고(자격 검증은 loginId/password로 수행) 별도 검증은 하지 않습니다.
   */
  http.post(`*${SIGN_IN_API_PATH}`, async ({ request }) => {
    let body: Partial<SignInRequest>;
    try {
      body = (await request.json()) as Partial<SignInRequest>;
    } catch {
      return errorResponse("INVALID_CREDENTIALS");
    }

    const { loginId, password } = body;
    const member = db.members.find(
      (m) => m.loginId === loginId && m.password === password,
    );

    if (!member) {
      return errorResponse("INVALID_CREDENTIALS");
    }

    // 로그인 성공 시 직전 로그아웃으로 무효화됐던 RT를 다시 유효화(새 세션 발급).
    db.revokedRefreshTokens.delete(MOCK_REFRESH_TOKEN);

    if (isWeb(request)) {
      return HttpResponse.json(webTokenBody, { headers: tokenCookieHeaders() });
    }
    return HttpResponse.json(appTokenBody);
  }),

  /**
   * POST /api/v1/auth/reissue — AT/RT 재발급.
   * WEB: `rt` 쿠키에서, APP: 바디 `refreshToken`에서 RT를 읽습니다.
   * 200 / 401 REFRESH_TOKEN_MISSING(없음) / 401 REFRESH_TOKEN_INVALID(유효하지 않음).
   */
  http.post(`*${REISSUE_API_PATH}`, async ({ request, cookies }) => {
    let token: string | undefined;

    if (isWeb(request)) {
      token = cookies.rt;
    } else {
      try {
        const body = (await request.json()) as ReissueRequest;
        token = body?.refreshToken;
      } catch {
        token = undefined;
      }
    }

    // 빈 문자열/누락은 MISSING, 값이 있으나 부적합(형식 오류·만료·무효화)은 INVALID로 구분.
    if (!token) {
      return errorResponse("REFRESH_TOKEN_MISSING");
    }
    if (token !== MOCK_REFRESH_TOKEN || db.revokedRefreshTokens.has(token)) {
      return errorResponse("REFRESH_TOKEN_INVALID");
    }

    if (isWeb(request)) {
      return HttpResponse.json(webTokenBody, { headers: tokenCookieHeaders() });
    }
    return HttpResponse.json(appTokenBody);
  }),

  /**
   * POST /api/v1/auth/logout — 로그아웃.
   * 멱등(항상 200, 바디 없음). WEB은 at/rt 쿠키를 즉시 만료.
   */
  http.post(`*${LOGOUT_API_PATH}`, ({ request }) => {
    if (!isWeb(request)) {
      // APP: 서버 처리 없음(클라이언트가 AT/RT 직접 삭제). 멱등 200.
      return new HttpResponse(null, { status: 200 });
    }
    // WEB: 서버가 RT를 무효화 → 이후 같은 RT로의 reissue는 401(REFRESH_TOKEN_INVALID).
    db.revokedRefreshTokens.add(MOCK_REFRESH_TOKEN);
    const headers = new Headers();
    headers.append("Set-Cookie", "at=; Path=/; HttpOnly; Max-Age=0");
    headers.append("Set-Cookie", "rt=; Path=/; HttpOnly; Max-Age=0");
    return new HttpResponse(null, { status: 200, headers });
  }),
];
