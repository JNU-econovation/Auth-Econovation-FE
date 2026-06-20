import { describe, it, expect } from "vitest";
import {
  ADMIN_CLIENTS_API_PATH,
  ADMIN_MEMBERS_API_PATH,
  MEMBERS_BATCH_API_PATH,
  MOCK_REDIRECT_URL,
  MOCK_REFRESH_TOKEN,
  REISSUE_API_PATH,
  SIGN_IN_API_PATH,
  SIGN_UP_API_PATH,
  LOGOUT_API_PATH,
} from "./constants";

/**
 * MSW 핸들러 자체에 대한 통합 테스트.
 *
 * 명세(`context/sso-api/`)의 모든 엔드포인트가 성공/에러 케이스별로 올바르게
 * 응답하는지, node MSW 서버를 통해 실제 fetch로 검증합니다. setup의 `resetDb()`가
 * 각 테스트 후 스토어를 seed로 되돌리므로 테스트 간 격리됩니다.
 */

const BASE = "http://localhost";

/** JSON 요청 헬퍼. 추가 헤더(역할/쿠키 등)를 병합할 수 있습니다. */
const call = (
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
) =>
  fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const VALID_SIGNUP = {
  name: "신규유저",
  loginId: "newuser01",
  password: "Econo1234!",
  generation: 33,
  status: "AM",
};

describe("그룹 1 — signup", () => {
  it("유효한 입력이면 201을 반환하고 바디가 없다", async () => {
    const res = await call("POST", SIGN_UP_API_PATH, VALID_SIGNUP);
    expect(res.status).toBe(201);
    expect(await res.text()).toBe("");
  });

  it("필수 필드 형식 오류면 400 VALIDATION_FAILED", async () => {
    const res = await call("POST", SIGN_UP_API_PATH, {
      ...VALID_SIGNUP,
      loginId: "a", // 3자 미만
    });
    expect(res.status).toBe(400);
    expect((await res.json()).errorCode).toBe("VALIDATION_FAILED");
  });

  it("비밀번호 정책 위반이면 400 INVALID_PASSWORD_POLICY", async () => {
    const res = await call("POST", SIGN_UP_API_PATH, {
      ...VALID_SIGNUP,
      password: "short", // 8자 미만
    });
    expect(res.status).toBe(400);
    expect((await res.json()).errorCode).toBe("INVALID_PASSWORD_POLICY");
  });

  it("loginId가 이미 존재하면 409 MEMBER_ALREADY_EXISTS", async () => {
    const res = await call("POST", SIGN_UP_API_PATH, {
      ...VALID_SIGNUP,
      loginId: "honggildong", // seed에 존재
    });
    expect(res.status).toBe(409);
    expect((await res.json()).errorCode).toBe("MEMBER_ALREADY_EXISTS");
  });

  it("가입 후 동일 자격으로 로그인할 수 있다(상태 유지)", async () => {
    await call("POST", SIGN_UP_API_PATH, VALID_SIGNUP);
    const res = await call("POST", SIGN_IN_API_PATH, {
      loginId: VALID_SIGNUP.loginId,
      password: VALID_SIGNUP.password,
    });
    expect(res.status).toBe(200);
  });
});

describe("그룹 1 — login", () => {
  it("WEB 성공 시 쿠키(at/rt)와 만료 시각·리다이렉트 URL만 반환", async () => {
    const res = await call("POST", SIGN_IN_API_PATH, {
      loginId: "honggildong",
      password: "Econo1234!",
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("at=");
    const json = await res.json();
    expect(json.accessExpiredTime).toBeTypeOf("number");
    expect(json.redirectUrl).toBe(MOCK_REDIRECT_URL);
    expect(json.accessToken).toBeUndefined();
  });

  it("APP 성공 시 토큰과 리다이렉트 URL을 바디로 반환", async () => {
    const res = await call(
      "POST",
      SIGN_IN_API_PATH,
      { loginId: "honggildong", password: "Econo1234!" },
      { "Client-Type": "APP" },
    );
    const json = await res.json();
    expect(json.accessToken).toBeTruthy();
    expect(json.refreshToken).toBe(MOCK_REFRESH_TOKEN);
    expect(json.redirectUrl).toBe(MOCK_REDIRECT_URL);
  });

  it("자격 불일치 시 401 INVALID_CREDENTIALS", async () => {
    const res = await call("POST", SIGN_IN_API_PATH, {
      loginId: "honggildong",
      password: "wrong",
    });
    expect(res.status).toBe(401);
    expect((await res.json()).errorCode).toBe("INVALID_CREDENTIALS");
  });
});

describe("그룹 1 — reissue", () => {
  it("WEB: rt 쿠키가 없으면 401 REFRESH_TOKEN_MISSING", async () => {
    const res = await call("POST", REISSUE_API_PATH);
    expect(res.status).toBe(401);
    expect((await res.json()).errorCode).toBe("REFRESH_TOKEN_MISSING");
  });

  it("WEB: rt 쿠키가 유효하지 않으면 401 REFRESH_TOKEN_INVALID", async () => {
    const res = await call("POST", REISSUE_API_PATH, undefined, {
      Cookie: "rt=tampered",
    });
    expect((await res.json()).errorCode).toBe("REFRESH_TOKEN_INVALID");
  });

  it("WEB: 유효한 rt 쿠키면 200 + 새 쿠키(만료 시각·리다이렉트 URL 포함)", async () => {
    const res = await call("POST", REISSUE_API_PATH, undefined, {
      Cookie: `rt=${MOCK_REFRESH_TOKEN}`,
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.accessExpiredTime).toBeTypeOf("number");
    expect(json.redirectUrl).toBe(MOCK_REDIRECT_URL);
  });

  it("APP: refreshToken 누락 시 401 REFRESH_TOKEN_MISSING", async () => {
    const res = await call("POST", REISSUE_API_PATH, {}, { "Client-Type": "APP" });
    expect((await res.json()).errorCode).toBe("REFRESH_TOKEN_MISSING");
  });

  it("APP: 유효한 refreshToken이면 200 + 토큰·리다이렉트 URL 바디", async () => {
    const res = await call(
      "POST",
      REISSUE_API_PATH,
      { refreshToken: MOCK_REFRESH_TOKEN },
      { "Client-Type": "APP" },
    );
    const json = await res.json();
    expect(json.accessToken).toBeTruthy();
    expect(json.redirectUrl).toBe(MOCK_REDIRECT_URL);
  });
});

describe("그룹 1 — logout", () => {
  it("멱등하게 항상 200을 반환한다", async () => {
    const res = await call("POST", LOGOUT_API_PATH);
    expect(res.status).toBe(200);
  });

  it("WEB 로그아웃 후 같은 RT로 재발급하면 401 REFRESH_TOKEN_INVALID", async () => {
    await call("POST", LOGOUT_API_PATH);
    const res = await call("POST", REISSUE_API_PATH, undefined, {
      Cookie: `rt=${MOCK_REFRESH_TOKEN}`,
    });
    expect(res.status).toBe(401);
    expect((await res.json()).errorCode).toBe("REFRESH_TOKEN_INVALID");
  });

  it("로그아웃 후 재로그인하면 RT가 다시 유효해진다", async () => {
    await call("POST", LOGOUT_API_PATH);
    await call("POST", SIGN_IN_API_PATH, {
      loginId: "honggildong",
      password: "Econo1234!",
    });
    const res = await call("POST", REISSUE_API_PATH, undefined, {
      Cookie: `rt=${MOCK_REFRESH_TOKEN}`,
    });
    expect(res.status).toBe(200);
  });
});

describe("그룹 2 — admin clients", () => {
  it("ADMIN 미만이면 403 FORBIDDEN", async () => {
    const res = await call(
      "POST",
      ADMIN_CLIENTS_API_PATH,
      { clientName: "x", redirectUris: ["https://x/cb"] },
      { "X-Mock-Role": "USER" },
    );
    expect(res.status).toBe(403);
    expect((await res.json()).errorCode).toBe("FORBIDDEN");
  });

  it("redirectUris 누락 시 400 REDIRECT_URI_REQUIRED", async () => {
    const res = await call("POST", ADMIN_CLIENTS_API_PATH, {
      clientName: "NEW APP",
    });
    expect((await res.json()).errorCode).toBe("REDIRECT_URI_REQUIRED");
  });

  it("clientName 누락 시 400 VALIDATION_FAILED", async () => {
    const res = await call("POST", ADMIN_CLIENTS_API_PATH, {
      redirectUris: ["https://x/cb"],
    });
    expect((await res.json()).errorCode).toBe("VALIDATION_FAILED");
  });

  it("clientName 중복 시 409 DUPLICATE_RESOURCE", async () => {
    const res = await call("POST", ADMIN_CLIENTS_API_PATH, {
      clientName: "ECONO SPA", // seed에 존재
      redirectUris: ["https://x/cb"],
    });
    expect((await res.json()).errorCode).toBe("DUPLICATE_RESOURCE");
  });

  it("정상 등록 시 201 + clientId", async () => {
    const res = await call("POST", ADMIN_CLIENTS_API_PATH, {
      clientName: "NEW APP",
      redirectUris: ["https://new/cb"],
    });
    expect(res.status).toBe(201);
    expect((await res.json()).clientId).toBeTruthy();
  });

  const SEED_CLIENT = "a1b2c3d4-1234-5678-9abc-def012345678";

  it("GET: 존재하는 클라이언트 정보 반환", async () => {
    const res = await call("GET", `${ADMIN_CLIENTS_API_PATH}/${SEED_CLIENT}`);
    const json = await res.json();
    expect(json.clientName).toBe("ECONO SPA");
    expect(json.redirectUris).toEqual(["https://app.econo.com/callback"]);
  });

  it("GET: 미존재 클라이언트는 404 NOT_FOUND", async () => {
    const res = await call("GET", `${ADMIN_CLIENTS_API_PATH}/no-such-id`);
    expect(res.status).toBe(404);
  });

  it("POST redirect-uris: 단건 추가", async () => {
    const res = await call(
      "POST",
      `${ADMIN_CLIENTS_API_PATH}/${SEED_CLIENT}/redirect-uris`,
      { uri: "https://added/cb" },
    );
    const json = await res.json();
    expect(json.redirectUris).toContain("https://added/cb");
    expect(json.redirectUris).toContain("https://app.econo.com/callback");
  });

  it("DELETE redirect-uris: 단건 삭제", async () => {
    const res = await call(
      "DELETE",
      `${ADMIN_CLIENTS_API_PATH}/${SEED_CLIENT}/redirect-uris`,
      { uri: "https://app.econo.com/callback" },
    );
    expect((await res.json()).redirectUris).not.toContain(
      "https://app.econo.com/callback",
    );
  });

  it("PUT redirect-uris: 전체 교체", async () => {
    const res = await call(
      "PUT",
      `${ADMIN_CLIENTS_API_PATH}/${SEED_CLIENT}/redirect-uris`,
      { uris: ["https://only/cb"] },
    );
    expect((await res.json()).redirectUris).toEqual(["https://only/cb"]);
  });
});

describe("그룹 3 — admin members", () => {
  it("ADMIN 미만이면 목록 조회 403", async () => {
    const res = await call(
      "GET",
      ADMIN_MEMBERS_API_PATH,
      undefined,
      { "X-Mock-Role": "USER" },
    );
    expect(res.status).toBe(403);
  });

  it("기본 페이지네이션(size 20)으로 목록 반환", async () => {
    const res = await call("GET", ADMIN_MEMBERS_API_PATH);
    const json = await res.json();
    expect(json.totalElements).toBe(23);
    expect(json.content).toHaveLength(20);
    expect(json.totalPages).toBe(2);
    expect(json.content[0]).toHaveProperty("role");
  });

  it("role 필터로 특정 역할만 조회", async () => {
    const res = await call(
      "GET",
      `${ADMIN_MEMBERS_API_PATH}?role=SUPER_ADMIN`,
    );
    const json = await res.json();
    expect(json.totalElements).toBe(1);
    expect(json.content[0].role).toBe("SUPER_ADMIN");
  });

  const roleUrl = (id: number) => `${ADMIN_MEMBERS_API_PATH}/${id}/role`;

  it("SUPER_ADMIN이 아니면 역할 변경 403 FORBIDDEN", async () => {
    const res = await call("PATCH", roleUrl(3), { role: "ADMIN" }, {
      "X-Mock-Role": "ADMIN",
    });
    expect((await res.json()).errorCode).toBe("FORBIDDEN");
  });

  it("유효하지 않은 역할 값이면 400 INVALID_ROLE", async () => {
    const res = await call("PATCH", roleUrl(3), { role: "BOSS" });
    expect((await res.json()).errorCode).toBe("INVALID_ROLE");
  });

  it("존재하지 않는 회원이면 404 NOT_FOUND", async () => {
    const res = await call("PATCH", roleUrl(9999), { role: "ADMIN" });
    expect(res.status).toBe(404);
  });

  it("본인 역할 변경이면 403 FORBIDDEN_SELF_ROLE_CHANGE", async () => {
    // 기본 actor id = 1
    const res = await call("PATCH", roleUrl(1), { role: "ADMIN" });
    expect((await res.json()).errorCode).toBe("FORBIDDEN_SELF_ROLE_CHANGE");
  });

  it("마지막 SUPER_ADMIN 강등이면 409", async () => {
    // actor를 id 2로 두어 self-change를 피하고, 유일한 super(id 1) 강등 시도
    const res = await call("PATCH", roleUrl(1), { role: "USER" }, {
      "X-Mock-Member-Id": "2",
    });
    expect((await res.json()).errorCode).toBe(
      "LAST_SUPER_ADMIN_CANNOT_BE_DEMOTED",
    );
  });

  it("정상 변경이면 200 + {memberId, role} (대소문자 무관)", async () => {
    const res = await call("PATCH", roleUrl(3), { role: "admin" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ memberId: 3, role: "ADMIN" });
  });
});

describe("그룹 4 — members batch", () => {
  it("ids 누락/형식 오류면 400 VALIDATION_FAILED", async () => {
    const res = await call("POST", MEMBERS_BATCH_API_PATH, { ids: [] });
    expect((await res.json()).errorCode).toBe("VALIDATION_FAILED");
  });

  it("존재하는 ID만 반환하고 미존재 ID는 조용히 제외(role 미포함)", async () => {
    const res = await call("POST", MEMBERS_BATCH_API_PATH, {
      ids: [1, 2, 9999],
    });
    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0]).not.toHaveProperty("role");
  });

  it("결과가 0개여도 200 + 빈 배열", async () => {
    const res = await call("POST", MEMBERS_BATCH_API_PATH, { ids: [9999] });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("ids가 1000개 초과면 400 VALIDATION_FAILED", async () => {
    const ids = Array.from({ length: 1001 }, (_, i) => i + 1);
    const res = await call("POST", MEMBERS_BATCH_API_PATH, { ids });
    expect(res.status).toBe(400);
  });

  it("정확히 1000개(경계)는 허용된다", async () => {
    const ids = Array.from({ length: 1000 }, (_, i) => i + 1);
    const res = await call("POST", MEMBERS_BATCH_API_PATH, { ids });
    expect(res.status).toBe(200);
  });
});
