---
title: Quick Start
description: 세 단계로 끝내는 SSO 연동 — 리다이렉트, 콜백 코드 수신, 서버 사이드 토큰 교환
---

# Quick Start

가장 단순한 웹 서비스 연동은 세 단계입니다.

## Step 1. 사용자를 SSO 페이지로 보내기 (프론트엔드)

내 서비스의 로그인 버튼을 클릭했을 때 사용자를 SSO 페이지로 이동시킵니다.

```typescript
const SSO_URL = "https://auth.econovation.kr";
const redirectUrl = encodeURIComponent("https://your-service.com/auth/callback");

window.location.href = `${SSO_URL}/?redirect-url=${redirectUrl}`;
```

### 쿼리 파라미터

SSO 로그인 페이지 URL에 붙여 보내는 파라미터입니다.

| 파라미터 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| `redirect-url` | 필수 | `string` | 로그인 성공 후 SSO 백엔드가 임시 토큰(`code`)을 붙여 리다이렉트할 콜백 URL입니다. `http://` 또는 `https://`로 시작하는 절대 URL이어야 하며, `new URL()`로 파싱 가능해야 합니다. 값은 반드시 `encodeURIComponent`로 인코딩해 전달하세요. |

각 파라미터의 특징을 짧게 정리하면 다음과 같습니다.

- **`redirect-url`은 절대 URL만 허용**됩니다. 상대 경로나 프로토콜이 빠진 형태는 SSO 페이지에서 *"유효하지 않은 리다이렉트 URL"* 메시지와 함께 거부됩니다.
- **`redirect-url`의 호스트는 등록된 오리진과 달라도 됩니다.** 오리진 검증은 이후 Step 3의 서버 사이드 토큰 교환 단계에서 수행됩니다.
- 옛 `client-type=WEB|APP` 파라미터는 **더 이상 사용하지 않습니다.** 새 흐름에는 클라이언트 타입 구분이 없습니다.

> 검증 규칙·예외 처리·옛 흐름과의 차이 등 더 자세한 내용은 [SSO 로그인 연동 — 쿼리 파라미터](./sso-integration#쿼리-파라미터) 문서를 참고하세요.

## Step 2. 콜백에서 임시 토큰을 서버로 전달 (프론트엔드)

로그인 성공 시 SSO 백엔드가 `redirect-url`에 일회용 임시 토큰을 붙여 리다이렉트합니다. 콜백 페이지에서는 이 코드를 곧바로 자체 백엔드로 넘겨주기만 하면 됩니다.

```typescript
// /auth/callback 페이지
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (code) {
  // 자체 백엔드로 코드 전달
  await fetch("/api/auth/sso/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
}
```

## Step 3. 서버에서 AT/RT 교환 (백엔드)

자체 백엔드가 SSO 백엔드와 직접 통신해 임시 토큰을 AT/RT로 교환합니다.

```typescript
// 자체 백엔드의 /api/auth/sso/exchange 핸들러
const response = await fetch("https://auth.econovation.kr/api/v1/auth/token/exchange", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": "https://your-service.com", // 등록된 오리진과 일치해야 함
  },
  body: JSON.stringify({
    code: receivedCode,
    client_id: process.env.SSO_CLIENT_ID,
    client_secret: process.env.SSO_CLIENT_SECRET,
  }),
});

const { accessToken, refreshToken, accessExpiredTime } = await response.json();
// 이후 사용자 세션에 저장 (HttpOnly 쿠키 권장)
```

*(TBD: 위 엔드포인트 경로와 요청 바디 필드명은 확정 시 갱신합니다.)*

## 다음으로

- 전체 흐름·검증 규칙·오리진 검증 상세는 [SSO 로그인 연동](./sso-integration)
- 콜백 처리·자체 백엔드 교환 예시는 [클라이언트 예시](./client-examples)
- 토큰 만료·리프레시 전략은 [토큰 사용 가이드](./token-guide)
- 엔드포인트 스펙은 [API 명세](./api-reference)
