---
title: 클라이언트 연동 예시
description: 복사해서 바로 쓰는 SSO 연동 코드 모음 (WEB / APP)
---

# 클라이언트 연동 예시

복사해서 바로 쓰는 SSO 연동 코드입니다. `CLIENT_ID`는 콘솔에서 발급받아 `.env`에 넣고 환경 변수로 읽어옵니다. `SSO_BASE_URL`만 본인 환경에 맞게 확인하세요.

- **WEB**: 토큰을 HttpOnly 쿠키로 받습니다.
- **APP**: 토큰을 응답 바디로 받아 `redirectUrl` 쿼리로 전달받습니다.
- **서버**: APP 서버 형태에서 토큰을 받아 검증·갱신합니다.

```bash
# .env (Vite 기준 — 다른 번들러면 prefix 규칙에 맞게 조정)
VITE_SSO_CLIENT_ID=a1b2c3d4-...
```

## WEB

**SSO 로그인 페이지로 이동** — 사용자를 SSO 로그인 페이지로 보냅니다.

```typescript
const SSO_BASE_URL = "https://auth.econovation.kr";
// 콘솔에서 발급받은 client-id를 .env에서 읽어옵니다 (Vite 기준)
const CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID;

export function redirectToLogin() {
  // SSO 로그인 페이지로 전체 페이지 이동. client-type=web → 토큰을 쿠키로 받습니다.
  // 복귀 주소(redirectUrl)는 client-id에 사전 등록되어 서버가 내려주므로 전달하지 않습니다.
  window.location.href = `${SSO_BASE_URL}/?client-id=${CLIENT_ID}&client-type=web`;
}
```

**로그인 후 세션 확인** — 복귀 후 쿠키 기반으로 현재 사용자를 조회합니다.

```tsx
import { useEffect, useState } from "react";

const SSO_BASE_URL = "https://auth.econovation.kr";

export function useSession() {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로그인 성공 시 AT/RT가 HttpOnly 쿠키로 발급된 상태로 복귀합니다.
    // credentials: "include" → 쿠키를 함께 보내 현재 사용자(/me)를 조회합니다.
    fetch(`${SSO_BASE_URL}/api/v1/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null)) // 401 등 실패 시 null
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
```

**토큰 재발급** — AT 만료 시 호출합니다. RT는 쿠키로 자동 전송됩니다.

```typescript
const SSO_BASE_URL = "https://auth.econovation.kr";

export async function reissue() {
  const res = await fetch(`${SSO_BASE_URL}/api/v1/auth/reissue`, {
    method: "POST",
    headers: { "Client-Type": "WEB" }, // WEB 분기: RT를 쿠키로 전송
    credentials: "include", // rt 쿠키 포함
  });
  if (!res.ok) throw new Error("reissue failed");
  // 새 AT/RT는 다시 쿠키로 발급되고, 바디엔 만료 시각·리다이렉트 URL만 옵니다.
  return res.json(); // { accessExpiredTime, redirectUrl }
}
```

## APP

**SSO 로그인 페이지로 이동** — `client-type=app`으로 보냅니다.

```typescript
const SSO_BASE_URL = "https://auth.econovation.kr";
// 콘솔에서 발급받은 client-id를 .env에서 읽어옵니다 (Vite 기준)
const CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID;

export function redirectToLogin() {
  // client-type=app → 토큰을 응답 바디로 받아 redirectUrl 쿼리로 전달받습니다.
  window.location.href = `${SSO_BASE_URL}/?client-id=${CLIENT_ID}&client-type=app`;
}
```

**복귀 콜백에서 토큰 추출** — 복귀 URL의 쿼리에서 토큰을 꺼냅니다.

```tsx
import { useSearchParams } from "react-router";

// 복귀 URL: <redirectUrl>?accessToken=...&refreshToken=...&accessExpiredTime=...
// 위 쿼리에서 토큰을 꺼내는 hook.
export function useAppAuthTokens() {
  const [params] = useSearchParams();
  return {
    accessToken: params.get("accessToken"),
    refreshToken: params.get("refreshToken"),
    accessExpiredTime: Number(params.get("accessExpiredTime")), // epoch millis
  };
}
```

**토큰을 자체 앱 서버로 전달 (서버 형태)** — 꺼낸 토큰으로 서버 세션을 구성합니다. 웹뷰에만 보관한다면 이 단계는 생략합니다.

```typescript
// SSO와의 추가 교환이 아니라, 이미 발급된 토큰을 자체 앱 서버에 전달·보관하는 단계입니다.
export async function createServerSession(tokens: {
  accessToken: string;
  refreshToken: string;
  accessExpiredTime: number;
}) {
  await fetch("https://api.your-app.com/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
  });
}
```

**토큰 재발급** — AT 만료 시 보관 중인 RT를 바디에 담아 호출합니다.

```typescript
const SSO_BASE_URL = "https://auth.econovation.kr";

export async function reissue(refreshToken: string) {
  const res = await fetch(`${SSO_BASE_URL}/api/v1/auth/reissue`, {
    method: "POST",
    // APP 분기: Content-Type 지정 + RT를 바디로 전송
    headers: { "Content-Type": "application/json", "Client-Type": "APP" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("reissue failed");
  // 새 AT/RT를 바디로 받습니다.
  return res.json(); // { accessToken, refreshToken, accessExpiredTime, redirectUrl }
}
```

## 서버 (APP 서버 형태)

APP 서버 형태에서 프론트가 전달한 토큰을 받아 검증·갱신하는 코드입니다. WEB은 쿠키 기반이라 보통 서버가 SSO 토큰을 직접 다루지 않습니다. `SSO_BASE_URL`은 환경 변수로 읽어옵니다.

**토큰 수신** — 프론트(`createServerSession`)가 전달한 토큰을 서버 세션에 저장합니다.

::: code-group

```ts [Express]
import express from "express";

const app = express();
app.use(express.json());

// 프론트(APP 웹뷰)가 전달한 토큰을 서버 세션에 저장합니다.
app.post("/sessions", (req, res) => {
  const { accessToken, refreshToken, accessExpiredTime } = req.body;
  req.session.tokens = { accessToken, refreshToken, accessExpiredTime };
  res.json({ ok: true });
});
```

```java [Spring Boot]
@RestController
@RequestMapping("/sessions")
public class SessionController {

  // 프론트(APP 웹뷰)가 전달한 토큰을 서버 세션에 저장합니다.
  @PostMapping
  public Map<String, Object> store(@RequestBody TokenRequest body, HttpSession session) {
    session.setAttribute("tokens", body);
    return Map.of("ok", true);
  }

  public record TokenRequest(
      String accessToken, String refreshToken, long accessExpiredTime) {}
}
```

:::

**사용자 검증** — 보관한 AT로 SSO `/api/v1/auth/me`를 호출해 유효성과 사용자 정보를 확인합니다.

::: code-group

```ts [Express]
const SSO_BASE_URL = process.env.SSO_BASE_URL!; // 예: https://auth.econovation.kr

// 보호 라우트 앞단에서 AT를 검증하는 미들웨어
export async function requireAuth(req, res, next) {
  const accessToken = req.session.tokens?.accessToken;
  if (!accessToken) return res.status(401).json({ error: "no token" });

  // AT 전달 방식(Authorization 헤더 등)은 SSO 백엔드 명세에 맞춰 조정하세요.
  const me = await fetch(`${SSO_BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!me.ok) return res.status(401).json({ error: "invalid token" });

  req.user = await me.json(); // 현재 로그인 사용자
  next();
}
```

```java [Spring Boot]
@Component
public class SsoClient {

  // 예: https://auth.econovation.kr
  private final RestClient client = RestClient.create(System.getenv("SSO_BASE_URL"));

  // 보관한 AT로 현재 로그인 사용자를 조회합니다.
  public Map<String, Object> me(String accessToken) {
    return client.get()
        .uri("/api/v1/auth/me")
        // AT 전달 방식은 SSO 백엔드 명세에 맞춰 조정하세요.
        .header("Authorization", "Bearer " + accessToken)
        .retrieve()
        .body(Map.class);
  }
}
```

:::

**토큰 재발급** — AT 만료 시 보관 중인 RT로 SSO `/api/v1/auth/reissue`를 호출합니다.

::: code-group

```ts [Express]
const SSO_BASE_URL = process.env.SSO_BASE_URL!;

app.post("/sessions/reissue", async (req, res) => {
  const refreshToken = req.session.tokens?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "no refresh token" });

  const r = await fetch(`${SSO_BASE_URL}/api/v1/auth/reissue`, {
    method: "POST",
    // APP 분기: RT를 바디로 전송
    headers: { "Content-Type": "application/json", "Client-Type": "APP" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!r.ok) return res.status(401).json({ error: "reissue failed" });

  // 새 토큰을 세션에 갱신합니다.
  req.session.tokens = await r.json(); // { accessToken, refreshToken, accessExpiredTime, redirectUrl }
  res.json({ ok: true });
});
```

```java [Spring Boot]
// SsoClient에 추가
public Map<String, Object> reissue(String refreshToken) {
  return client.post()
      .uri("/api/v1/auth/reissue")
      .header("Content-Type", "application/json")
      .header("Client-Type", "APP") // APP 분기
      .body(Map.of("refreshToken", refreshToken))
      .retrieve()
      .body(Map.class); // { accessToken, refreshToken, accessExpiredTime, redirectUrl }
}
```

:::

---

에러 응답 처리는 [API 명세](./api-reference)를 참고하세요.
