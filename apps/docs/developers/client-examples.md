---
title: 클라이언트 연동 예시
description: 로그인 페이지 리다이렉트, 콜백 코드 수신, 자체 백엔드의 토큰 교환 예시
---

# 클라이언트 연동 예시

본 SSO는 **임시 토큰 교환 방식**입니다. 콜백에는 일회용 임시 토큰(`code`)만 도착하며, 실제 AT/RT는 자체 백엔드가 SSO 백엔드와 직접 통신해서 받아옵니다.

## 1) 로그인 페이지로 리다이렉트 (프론트엔드)

```typescript
// src/auth/redirectToLogin.ts
const SSO_BASE_URL = "https://auth.econovation.kr";

export function redirectToLogin(callbackPath = "/auth/callback") {
  const redirectUrl = encodeURIComponent(
    `${window.location.origin}${callbackPath}`,
  );
  window.location.href = `${SSO_BASE_URL}/?redirect-url=${redirectUrl}`;
}
```

## 2) React 콜백 핸들러 — code를 자체 백엔드로 전달

```tsx
// src/pages/AuthCallback.tsx
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return; // Strict Mode 중복 호출 방지
    exchanged.current = true;

    const code = params.get("code");

    if (!code) {
      navigate("/login?error=missing-code", { replace: true });
      return;
    }

    fetch("/api/auth/sso/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("exchange failed");
        navigate("/", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=exchange-failed", { replace: true });
      });
  }, [params, navigate]);

  return <p>로그인 처리 중...</p>;
}
```

> 임시 토큰은 일회용입니다. `useEffect`가 Strict Mode에서 두 번 실행되면 두 번째 호출이 `4012 이미 사용된 임시 토큰` 에러로 실패합니다. 위 예시처럼 ref로 중복 호출을 차단하세요.

## 3) 자체 백엔드의 토큰 교환 핸들러 (Node.js 예시)

```typescript
// /api/auth/sso/exchange 핸들러
export async function exchangeHandler(req, res) {
  const { code } = req.body;

  const ssoResponse = await fetch(
    "https://auth.econovation.kr/api/v1/auth/token/exchange",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // SSO 백엔드는 요청의 Origin이 등록 오리진과 일치하는지 검증합니다.
        "Origin": "https://your-service.com",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.SSO_CLIENT_ID,
        client_secret: process.env.SSO_CLIENT_SECRET,
      }),
    },
  );

  if (!ssoResponse.ok) {
    return res.status(401).json({ error: "exchange failed" });
  }

  const { data } = await ssoResponse.json();
  const { accessToken, refreshToken, accessExpiredTime } = data;

  // HttpOnly 쿠키로 세션 저장(권장)
  res.setHeader("Set-Cookie", [
    `at=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
    `rt=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
  ]);
  res.json({ ok: true, accessExpiredTime });
}
```

*(TBD: 위 엔드포인트 경로와 요청 바디 필드명은 확정 시 갱신합니다.)*

## 4) AT 만료 시 RT로 갱신 (백엔드)

```typescript
// /api/auth/sso/refresh 핸들러
export async function refreshHandler(req, res) {
  const refreshToken = req.cookies.rt;
  if (!refreshToken) return res.status(401).json({ error: "no refresh token" });

  const ssoResponse = await fetch(
    "https://auth.econovation.kr/api/v1/auth/token/refresh",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (!ssoResponse.ok) {
    return res.status(401).json({ error: "refresh failed" });
  }

  const { data } = await ssoResponse.json();
  res.setHeader("Set-Cookie", [
    `at=${data.accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
    `rt=${data.refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
  ]);
  res.json({ ok: true, accessExpiredTime: data.accessExpiredTime });
}
```
