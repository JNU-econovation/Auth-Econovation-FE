---
title: SSO 동작 들여다보기
description: 에코노베이션 SSO가 내부적으로 어떻게 동작하는지 — 클라이언트 등록, WEB/APP 토큰 전달 방식, 리다이렉트, 토큰 재발급 메커니즘
---

# SSO 동작 들여다보기

이 문서는 에코노베이션 SSO의 **내부 동작 방식**을 설명합니다. 로그인 흐름에서 어떤 일이 일어나는지, WEB과 APP의 토큰 전달 방식이 왜 다른지, 리다이렉트가 어떻게 이루어지는지를 다룹니다.

연동 절차는 [Quick Start](./quick-start)를 참조하십시오. 코드 예시는 [클라이언트 예시](./client-examples)를 참조하십시오.

## 전체 구조 — WEB과 APP

에코노베이션 SSO는 `client-type`에 따라 토큰 전달 방식이 달라집니다. 이 구분은 로그인 요청부터 리다이렉트까지 일관되게 적용됩니다.

| | WEB | APP |
| --- | --- | --- |
| 토큰 전달 위치 | `at`/`rt` HttpOnly 쿠키 | 응답 본문(body) |
| 리다이렉트 URL | `redirectUrl` 그대로 | `redirectUrl?accessToken=...&refreshToken=...&accessExpiredTime=...` |
| 재발급 시 RT 전달 | `rt` 쿠키에서 자동 | 요청 본문 `refreshToken` 필드 |

WEB은 토큰이 HttpOnly 쿠키에 담기므로 브라우저 스크립트에서 토큰에 직접 접근할 수 없습니다. APP은 토큰이 리다이렉트 URL 쿼리에 실리므로, 반드시 HTTPS를 사용하고 수신 즉시 안전한 저장소로 옮기십시오.

### WEB 흐름

```
[클라이언트 서비스]            [SSO 프론트엔드]              [SSO 백엔드]
       │                            │                            │
       │ (1) SSO 페이지로 이동       │                            │
       │   ?client-id=...           │                            │
       │ ─────────────────────────► │                            │
       │                            │ (2) ID/PW 입력 후           │
       │                            │     POST /auth/login        │
       │                            │     (Client-Type: WEB)      │
       │                            │ ─────────────────────────► │
       │                            │                            │
       │                            │ (3) at/rt 쿠키(HttpOnly)   │
       │                            │     + body{accessExpiredTime│
       │                            │            redirectUrl}     │
       │                            │ ◄───────────────────────── │
       │                            │                            │
       │ (4) redirectUrl로 이동      │                            │
       │     (브라우저가 쿠키 동반)   │                            │
       │ ◄───────────────────────── │                            │
```

### APP 흐름

```
[네이티브 앱 / 웹뷰]           [SSO 프론트엔드]              [SSO 백엔드]
       │                            │                            │
       │ (1) SSO 페이지로 이동       │                            │
       │   ?client-id=...           │                            │
       │   &client-type=app         │                            │
       │ ─────────────────────────► │                            │
       │                            │ (2) ID/PW 입력 후           │
       │                            │     POST /auth/login        │
       │                            │     (Client-Type: APP)      │
       │                            │ ─────────────────────────► │
       │                            │                            │
       │                            │ (3) body{accessToken,       │
       │                            │        refreshToken,        │
       │                            │        accessExpiredTime,   │
       │                            │        redirectUrl}         │
       │                            │ ◄───────────────────────── │
       │                            │                            │
       │ (4) redirectUrl?accessToken=…&refreshToken=…            │
       │       &accessExpiredTime=… 로 이동                      │
       │ ◄───────────────────────── │                            │
       │ (5) 네이티브 앱이 쿼리에서 토큰 수신                      │
```

## 클라이언트 서비스 등록

에코노베이션 SSO에 연동하려면 각 서비스를 **Client**로 등록해야 합니다. 서비스 종류(Web / App)와 콜백 URL을 함께 등록하면 `client-id`를 발급받습니다.

`client-id`는 SSO 진입 URL에 쿼리 파라미터로 전달합니다. SSO 백엔드는 `clientId`로 어느 서비스의 로그인인지 판별하고, 등록된 콜백 URL을 로그인 응답의 `redirectUrl`로 반환합니다. `redirectUrl`은 클라이언트가 직접 지정하지 않으며, SSO 백엔드가 `client-id`에 매핑된 값을 응답합니다.

## SSO 진입 파라미터

사용자를 SSO 로그인 페이지로 이동시킬 때 쿼리 파라미터로 클라이언트를 식별합니다.

```
https://auth.econovation.kr/?client-id=<your-client-id>&client-type=<web|app>
```

| 파라미터 | 필수 | 설명 |
| --- | --- | --- |
| `client-id` | 필수 | 등록 시 발급받은 클라이언트 식별자. SSO 백엔드가 이 값으로 콜백 URL(`redirectUrl`)을 결정합니다. |
| `client-type` | 선택 | `web`(기본) 또는 `app`. 토큰을 쿠키로 받을지 응답 본문으로 받을지를 결정합니다. |

SSO 프론트엔드는 `client-type` 쿼리 값을 소문자로 정규화한 뒤, `app`이 아니면 모두 `WEB`으로 처리합니다. 이 값은 로그인 요청의 `Client-Type` 헤더(`WEB` / `APP`, 대문자)로 변환되어 SSO 백엔드에 전달됩니다.

```typescript
// SSO 프론트엔드 내부 변환 로직
const resolveClientType = (raw: string | null): "WEB" | "APP" =>
  raw?.toLowerCase() === "app" ? "APP" : "WEB";
```

## 로그인 요청과 토큰 발급

사용자가 ID/PW를 입력하면 SSO 프론트엔드가 SSO 백엔드 로그인 API를 호출합니다. `Client-Type` 헤더로 토큰 전달 방식을 지정합니다.

```
POST /api/v1/auth/login
Client-Type: WEB        # 또는 APP
```

요청 본문에 로그인 ID, 비밀번호, 클라이언트 식별자를 담아 전송합니다.

```json
{
  "loginId": "hong123",
  "password": "Econo1234!",
  "clientId": "a1b2c3d4-..."
}
```

로그인에 성공하면 `Client-Type`에 따라 토큰을 받는 위치가 달라집니다.

### WEB 응답

AT/RT가 `at`/`rt` HttpOnly 쿠키로 발급됩니다. 응답 본문에는 토큰 없이 만료 시각과 콜백 URL만 담깁니다.

```json
{
  "accessExpiredTime": 1900000000000,
  "redirectUrl": "https://your-service.com/callback"
}
```

### APP 응답

AT/RT가 응답 본문으로 전달됩니다.

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "accessExpiredTime": 1900000000000,
  "redirectUrl": "https://your-service.com/callback"
}
```

| 필드 | 설명 |
| --- | --- |
| `accessExpiredTime` | AT 만료 시각. Unix epoch 밀리초(ms) 단위입니다. |
| `redirectUrl` | 로그인 성공 후 이동할 콜백 URL. WEB·APP 공통으로 응답합니다. |
| `accessToken` | Access Token. APP 전용입니다. |
| `refreshToken` | Refresh Token. APP 전용입니다. |

## 리다이렉트 메커니즘

SSO 프론트엔드는 로그인 응답 본문의 `redirectUrl`로 `window.location`을 변경해 전체 페이지를 이동시킵니다. WEB과 APP은 이동 URL 형태가 다릅니다.

- **WEB**: `redirectUrl`로 그대로 이동합니다. 브라우저가 `at`/`rt` 쿠키를 자동으로 함께 전송합니다.
- **APP**: 응답 본문으로 받은 토큰을 `redirectUrl` 쿼리에 추가해 이동합니다. 네이티브 앱(또는 웹뷰)이 이 쿼리를 파싱해 토큰을 수신합니다.

```
# WEB
https://your-service.com/callback

# APP
https://your-service.com/callback?accessToken=...&refreshToken=...&accessExpiredTime=...
```

APP 흐름의 쿼리 파라미터 키는 `accessToken`, `refreshToken`, `accessExpiredTime`(모두 camelCase)입니다.

커스텀 스킴(예: `econoapp://callback`)에도 동일한 방식으로 쿼리가 추가됩니다.

## 토큰 재발급

AT가 만료되면 RT로 새 AT/RT를 발급받습니다. 재발급 시에도 `Client-Type` 헤더에 따라 RT 전달 방식이 달라집니다.

```
POST /api/v1/auth/reissue
Client-Type: WEB        # 또는 APP
```

- **WEB**: RT를 `rt` 쿠키에서 자동으로 읽습니다. 요청 본문은 비워 둡니다. 새 토큰도 쿠키로 내려옵니다.
- **APP**: RT를 요청 본문 `refreshToken` 필드에 담아 보냅니다. 새 토큰도 본문으로 받습니다.

```json
// APP 재발급 요청 본문
{
  "refreshToken": "..."
}
```

재발급 응답 본문의 구조는 로그인 응답과 동일합니다. WEB 응답은 `accessExpiredTime`과 `redirectUrl`을, APP 응답은 `accessToken`·`refreshToken`·`accessExpiredTime`·`redirectUrl`을 포함합니다.
