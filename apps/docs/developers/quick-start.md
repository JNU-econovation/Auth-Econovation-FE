---
title: Quick Start
description: 두 단계로 끝내는 SSO 연동 — client-id로 로그인 페이지로 보내고, 돌아온 사용자에서 토큰 받기
---

# Quick Start

가장 단순한 웹 서비스 연동은 두 단계입니다. 먼저 [클라이언트 등록](https://console-auth-econovation-fe.vercel.app/)을 통해 `client-id`와 콜백(리다이렉트) URL을 발급받았다고 가정합니다.

> 이 SSO는 별도의 _authorization code 교환_ 단계가 없는 **직접 토큰 발급** 방식입니다. 사용자가 SSO 페이지에서 로그인하면 서버가 토큰(WEB은 쿠키 / APP은 리다이렉트 쿼리)과 함께, `client-id`에 매핑된 콜백 URL(`redirectUrl`)로 사용자를 돌려보냅니다. 내 서비스가 직접 토큰 교환 요청을 보내는 단계는 없습니다.

## 한눈에 보기

<div style="margin:1.5rem 0;">
<svg viewBox="0 0 600 486" width="100%" style="max-width:600px;height:auto;display:block;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" role="img" aria-label="SSO 연동 2단계 흐름: 내 서비스가 client-id를 붙여 SSO 페이지로 보내고(Step 1), 로그인 성공 후 redirectUrl로 돌아온 콜백에서 토큰을 받는다(Step 2). 가운데 SSO 로그인 페이지와 SSO 백엔드 구간은 SSO가 자동 처리한다.">
  <title>SSO 연동 2단계 흐름도</title>
  <defs>
    <marker id="qs-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,0 L7,3 L0,6 Z" fill="#475569" />
    </marker>
  </defs>

  <rect x="110" y="40" width="380" height="58" rx="8" fill="#ffffff" stroke="#2563eb" stroke-width="1.5" />
  <text x="300" y="66" text-anchor="middle" font-size="14" font-weight="700" fill="#1e3a8a">내 서비스 (프론트엔드)</text>
  <text x="300" y="86" text-anchor="middle" font-size="12" fill="#475569">로그인 버튼을 누르면 SSO 연동이 시작됩니다</text>

  <line x1="300" y1="98" x2="300" y2="138" stroke="#475569" stroke-width="1.5" marker-end="url(#qs-arrow)" />
  <text x="312" y="122" font-size="12.5" font-weight="700" fill="#2563eb">Step 1 · client-id 붙여 SSO로 이동</text>

  <rect x="78" y="140" width="444" height="186" rx="10" fill="none" stroke="#cbd5e1" stroke-width="1.3" stroke-dasharray="5 4" />
  <text x="300" y="159" text-anchor="middle" font-size="11.5" font-style="italic" fill="#64748b">SSO가 자동으로 처리 — 내 서비스는 관여하지 않음</text>

  <rect x="120" y="170" width="360" height="52" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.3" />
  <text x="300" y="191" text-anchor="middle" font-size="13.5" font-weight="700" fill="#334155">SSO 로그인 페이지</text>
  <text x="300" y="210" text-anchor="middle" font-size="11.5" font-family="monospace" fill="#64748b">auth.econovation.kr</text>

  <line x1="300" y1="222" x2="300" y2="250" stroke="#475569" stroke-width="1.5" marker-end="url(#qs-arrow)" />
  <text x="312" y="240" font-size="11.5" fill="#64748b">사용자 ID / PW 제출</text>

  <rect x="120" y="250" width="360" height="64" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.3" />
  <text x="300" y="270" text-anchor="middle" font-size="13.5" font-weight="700" fill="#334155">SSO 백엔드</text>
  <text x="300" y="289" text-anchor="middle" font-size="11.5" font-family="monospace" fill="#475569">POST /api/v1/auth/login</text>
  <text x="300" y="307" text-anchor="middle" font-size="11.5" fill="#475569">토큰 발급 + redirectUrl 결정</text>

  <line x1="300" y1="326" x2="300" y2="366" stroke="#475569" stroke-width="1.5" marker-end="url(#qs-arrow)" />
  <text x="312" y="350" font-size="12.5" font-weight="700" fill="#2563eb">Step 2 · redirectUrl 로 복귀</text>

  <rect x="110" y="366" width="380" height="100" rx="8" fill="#ffffff" stroke="#2563eb" stroke-width="1.5" />
  <text x="300" y="388" text-anchor="middle" font-size="14" font-weight="700" fill="#1e3a8a">내 콜백 (프론트엔드 또는 백엔드)</text>

  <rect x="130" y="402" width="46" height="20" rx="10" fill="#dbeafe" />
  <text x="153" y="416" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">WEB</text>
  <text x="186" y="416" font-size="11" fill="#334155">accessToken / refreshToken을 HttpOnly 쿠키로 자동 수신</text>

  <rect x="130" y="430" width="46" height="20" rx="10" fill="#dcfce7" />
  <text x="153" y="444" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">APP</text>
  <text x="186" y="444" font-size="12" fill="#334155">redirectUrl 쿼리에서 토큰 파싱</text>
</svg>
</div>

- **Step 1, Step 2는 내 서비스가 직접 하는 일**입니다. 가운데 `SSO 로그인 페이지 ↔ SSO 백엔드` 구간(로그인 제출·토큰 발급)은 SSO가 알아서 처리하므로 내 서비스가 관여하지 않습니다.
- 토큰 전달 매체는 `client-type`으로 갈립니다 — **WEB은 쿠키, APP은 리다이렉트 쿼리**.

## Step 1. 사용자를 SSO 페이지로 보내기 (프론트엔드)

내 서비스의 로그인 버튼을 클릭했을 때, 발급받은 `client-id`를 붙여 사용자를 SSO 페이지로 이동시킵니다.

```typescript
const SSO_URL = "https://auth.econovation.kr";

// client-id는 소스에 하드코딩하지 말고 환경 변수로 주입합니다.
// (env 주입 방식은 빌드 도구에 따라 다릅니다 — 예: Vite)
const clientId = import.meta.env.VITE_SSO_CLIENT_ID;

if (!clientId) {
  throw new Error("VITE_SSO_CLIENT_ID가 설정되지 않았습니다.");
}

// 웹 서비스: client-type 생략 가능(기본 web)
window.location.href = `${SSO_URL}/?client-id=${clientId}`;

// 앱 웹뷰: client-type=app
// 만약 쿠키 정책을 사용하지 못하는 웹뷰로 sso를 사용한다면 client-type을 꼭 명시하세요!
// 명시하면 리다이랙트시 토큰을 함께 전달받을 수 있습니다.
// window.location.href = `${SSO_URL}/?client-id=${clientId}&client-type=app`;
```

> ⚠️ **`client-id`를 소스 코드에 하드코딩하지 마세요.** 환경 변수로 주입하고 환경(개발/스테이징/운영)마다 다른 값을 사용하세요. `client-id`는 SSO 진입 URL의 쿼리로 전달되어 브라우저에 노출되는 **식별자**이지 비밀값은 아니지만, 소스에 박아 두면 환경 분리가 깨지고 레포가 유출되면 그대로 드러납니다. 진짜 비밀인 `client-secret`은 프론트엔드·브라우저에 두지 말고 서버에서만 보관하세요.

### 쿼리 파라미터

SSO 로그인 페이지 URL에 붙여 보내는 파라미터입니다.

| 파라미터      | 필수 | 타입               | 설명                                                                                                                                       |
| ------------- | ---- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `client-id`   | 필수 | `string`           | 사전에 콜백(리다이렉트) URL을 등록하고 발급받은 클라이언트 ID. 로그인 성공 시 서버는 이 값에 매핑된 `redirectUrl`로 사용자를 돌려보냅니다. |
| `client-type` | 선택 | `"web"` \| `"app"` | 클라이언트 타입. 미지정 시 `web`. 웹 서비스는 `web`(쿠키로 토큰 수령), 앱 웹뷰는 `app`(리다이렉트 쿼리로 토큰 수령).                       |

각 파라미터의 특징을 짧게 정리하면 다음과 같습니다.

- **`client-id`는 필수**입니다. 콜백 URL(`redirectUrl`)은 내 서비스가 쿼리로 보내는 값이 아니라, 등록된 `client-id`에 매핑되어 **서버가 로그인 응답으로 내려줍니다.**
- **`client-type`은 WEB/APP의 토큰 전달 방식을 가릅니다.** SSO 페이지가 이 쿼리 값(소문자 `web`|`app`)을 백엔드 요청의 `Client-Type: WEB|APP` 헤더로 변환합니다.

> 전체 흐름·검증 규칙·클라이언트 등록 등 더 자세한 내용은 [SSO 동작 들여다보기](./sso-integration) 문서를 참고하세요.

## Step 2. 콜백에서 돌아온 사용자 받기

사용자가 SSO 페이지에서 로그인에 성공하면, 서버는 `client-id`에 매핑된 콜백 URL(`redirectUrl`)로 사용자를 리다이렉트합니다. 토큰을 받는 방식은 `client-type`에 따라 다릅니다.

> **콜백은 프론트엔드 페이지일 수도, 백엔드 엔드포인트일 수도 있습니다.** SSO 페이지는 등록된 `redirectUrl`로 브라우저/웹뷰를 전체 이동시키므로, 그 URL이 백엔드 라우트라면 백엔드가 같은 쿼리(APP)·쿠키(WEB)를 그대로 받습니다. 등록한 `redirectUrl`을 프론트 콜백 페이지로 둘지 백엔드 콜백 엔드포인트로 둘지는 서비스 구조에 맞게 선택하세요.

### WEB — HttpOnly 쿠키

Access Token/Refresh Token이 HttpOnly 쿠키(`at`/`rt`)로 자동 설정됩니다. 콜백에서 토큰을 직접 파싱할 필요 없이, 이후 같은 도메인으로의 요청에 쿠키가 함께 전송됩니다.

```typescript
// /callback — 토큰 쿠키는 브라우저가 자동 보관하므로 별도 수신 코드가 필요 없습니다.
// 필요하면 보호된 리소스를 호출해 로그인 상태만 확인합니다.
```

### APP — 리다이렉트 쿼리

Access Token/Refresh Token이 콜백 URL의 쿼리 스트링으로 전달됩니다. 콜백을 받는 주체(웹뷰 프론트 또는 백엔드)에서 쿼리를 파싱해 토큰을 보관하세요.

**프론트엔드(웹뷰)에서 받는 경우** — `window.location`에서 파싱합니다.

```typescript
// redirectUrl?access-token=...&accessExpiredTime=...&refreshToken=...
const params = new URLSearchParams(window.location.search);
const accessToken = params.get("access-token");
const accessExpiredTime = params.get("accessExpiredTime");
const refreshToken = params.get("refreshToken");
// 이후 앱 내 저장소에 안전하게 보관
```

**백엔드에서 받는 경우** — `redirectUrl`을 백엔드 콜백 엔드포인트로 등록하면, 브라우저/웹뷰가 그 주소로 이동할 때 GET 요청의 쿼리로 토큰이 전달됩니다. 요청 객체의 쿼리에서 동일한 키로 읽습니다.

```typescript
// 예: Node.js/Express — GET /auth/callback?access-token=...&accessExpiredTime=...&refreshToken=...
app.get("/auth/callback", (req, res) => {
  const accessToken = req.query["access-token"];
  const accessExpiredTime = req.query["accessExpiredTime"];
  const refreshToken = req.query["refreshToken"];

  // 서버 세션에 저장하거나 HttpOnly 쿠키로 다시 내려준 뒤,
  // 토큰이 노출되지 않는 깨끗한 URL로 리다이렉트합니다.
  res.redirect("/");
});
```

> ⚠️ APP 흐름은 토큰이 URL 쿼리에 실려 오므로, 서버 액세스 로그·브라우저 히스토리·`Referer` 헤더에 남을 수 있습니다. 반드시 HTTPS로 받고, 위 예시처럼 토큰을 세션/쿠키로 옮긴 뒤 **토큰이 빠진 URL로 즉시 리다이렉트**하세요.

## 로그인 다음 — 게이트웨이로 API 호출하기

로그인이 끝나면, 발급받은 토큰으로 내 백엔드 API를 호출합니다. 이때 클라이언트는 백엔드 서버 주소를 직접 호출하지 않고, **단일 진입점인 API Gateway(`api.econovation.kr`)** 로 요청을 보냅니다.

게이트웨이는 모든 요청에서 SSO 토큰을 검증(인증)하고 권한을 확인(인가)합니다. 검사를 통과한 요청에만 사용자 신원 정보를 헤더(`X-User-Passport`)로 주입해 upstream 서버로 전달합니다. 덕분에 **내 백엔드 서버는 토큰을 직접 파싱하거나 SSO와 통신할 필요가 없습니다.**

백엔드는 사용자 신원 정보를 헤더(`X-User-Passport`)를 `econo-passport` Spring Boot 공용 라이브러리를 사용하여 사용자 정보를 가져올 수 있습니다.
[econo-passport 사용 가이드] 를 참고하세요

클라이언트의 요청 경로는 `api.econovation.kr/api/{네임스페이스}/...` 형태입니다. 게이트웨이가 `pathPrefix`(`/api/{네임스페이스}`)로 어느 서비스인지 식별한 뒤, 그 부분을 떼어내고 남은 경로를 내 백엔드(`upstreamUrl`)로 전달합니다.

```typescript
// WEB: 로그인 시 받은 at/rt 쿠키가 같은 상위 도메인(econovation.kr) 요청에 자동 첨부됩니다.
const res = await fetch(
  "https://api.econovation.kr/api/eeos/guest/programs?category=all",
  {
    credentials: "include",
  },
);

// APP: 보관해 둔 access token을 Authorization 헤더로 전달합니다.
const res = await fetch(
  "https://api.econovation.kr/api/eeos/guest/programs?category=all",
  {
    headers: { Authorization: `Bearer ${accessToken}` },
  },
);
```

> 위 예시가 동작하려면 먼저 [콘솔](https://console-auth-econovation-fe.vercel.app)에서 내 서비스의 라우트(`pathPrefix` → `upstreamUrl`)를 등록해야 합니다. 라우팅 규칙·경로 재작성·인증·인가 처리 방식과 서비스 등록 절차는 [API Gateway 동작 원리](./gateway) 문서를 참고하세요.

## 다음으로

- 전체 흐름·검증 규칙·클라이언트 등록은 [SSO 동작 들여다보기](./sso-integration)
- 게이트웨이 라우팅·서비스 등록은 [API Gateway 동작 원리](./gateway)
- 콜백 처리 예시는 [클라이언트 예시](./client-examples)
- 엔드포인트 스펙은 [API 명세](./api-reference)
