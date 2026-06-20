---
title: API 명세
description: 에코노베이션 SSO 백엔드 엔드포인트의 요청·응답·에러 계약 참조 — me·reissue·logout 직접 호출 계약
---

# API 명세

엔드포인트별 요청·응답·에러 계약을 확인합니다. 연동 절차는 [Quick Start](./quick-start), 동작 원리는 [SSO 동작 들여다보기](./sso-integration)를 참고하세요.

외부 서비스가 직접 호출하는 엔드포인트는 `GET /api/v1/auth/me`, `POST /api/v1/auth/reissue`, `POST /api/v1/auth/logout` 세 가지입니다.

> 회원·역할·OAuth 클라이언트 관리 등 어드민 API(`/api/v1/admin/*`)는 관리자 콘솔 전용이며 이 문서에서 다루지 않습니다.

## 공통 규약

### 베이스 URL

이 문서의 모든 경로는 SSO 백엔드 호스트 기준의 상대 경로입니다.

- 현재 [클라이언트 연동 예시](./client-examples)는 SSO URL(`https://auth.econovation.kr`)을 베이스로 `/api/v1/auth/*`를 호출하도록 작성되어 있습니다.
- **외부 서비스가 직접 호출할 백엔드 호스트는 확정되지 않았습니다.** *(TBD: 운영 백엔드 호스트 미확정)*

### Client-Type 헤더

`reissue`, `logout` 엔드포인트는 `Client-Type` 요청 헤더로 토큰 전달 매체를 결정합니다.

| 값 | 기본값 | 토큰 매체 |
| --- | --- | --- |
| `WEB` | 미지정 시 `WEB`으로 처리 | `at`/`rt` HttpOnly 쿠키 |
| `APP` | 명시해야 합니다 | 요청·응답 본문(body) |

WEB/APP 동작 차이의 배경은 [SSO 동작 들여다보기](./sso-integration)를 참고하세요.

### 인증 방식

- **WEB** — SSO 로그인([Quick Start](./quick-start) 참고) 후 SSO 백엔드가 `at`(Access Token)·`rt`(Refresh Token)를 HttpOnly 쿠키로 발급합니다. 이후 동일 도메인 요청에는 브라우저가 쿠키를 자동 전송하므로, 요청할 때 `withCredentials: true`를 설정하세요.
- **APP** — SSO 로그인([Quick Start](./quick-start) 참고) 후 토큰을 응답 본문으로 받습니다. 보호된 자원을 호출할 때는 `Authorization: Bearer <accessToken>` 헤더로 Access Token을 전송하고, 재발급 시에는 요청 본문의 `refreshToken` 필드로 Refresh Token을 전송합니다.

### 공통 에러 응답 형식

모든 에러 응답은 다음 스키마를 따릅니다.

```json
{
  "errorCode": "REFRESH_TOKEN_INVALID",
  "message": "유효하지 않은 Refresh token입니다.",
  "timestamp": "2026-06-03T18:00:00"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `errorCode` | `string` | 에러 코드 식별자. [에러 코드](#에러-코드)를 참고하세요. |
| `message` | `string` | 사용자 표시용 메시지 |
| `timestamp` | `string` | 에러 발생 시각. ISO 8601 초 단위(`YYYY-MM-DDTHH:mm:ss`, 타임존·밀리초 없음) |

## 외부 호출 엔드포인트

### GET /api/v1/auth/me

현재 로그인한 사용자의 신원과 역할을 조회합니다. 토큰 유효성 확인(로그인 여부 판정)과 사용자 정보 조회에 사용합니다.

**호출 주체**: 외부 서비스 프론트엔드 또는 백엔드

#### 요청 헤더

| 헤더 | 필수 | 설명 |
| --- | --- | --- |
| `Cookie: at=<token>` (WEB) | 필수 | 브라우저가 `withCredentials` 설정 시 자동 전송 |
| `Authorization: Bearer <token>` (APP) | 필수 | APP 클라이언트는 Bearer 토큰으로 전달 |

> ⚠️ `me` 엔드포인트의 경로와 APP 인증 방식은 SSO 백엔드 명세 미확정입니다. 백엔드 확정 시 갱신합니다. *(코드: `packages/api/src/auth/v1/me/index.ts`)*

#### 요청 본문

없음.

#### me 응답 — 200 OK

```json
{
  "memberId": 1,
  "name": "홍길동",
  "loginId": "hong42",
  "generation": 30,
  "status": "AM",
  "role": "USER"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `memberId` | `number` | 회원 ID |
| `name` | `string` | 이름 |
| `loginId` | `string` | 로그인 ID |
| `generation` | `number` | 기수 |
| `status` | `string` | 활동 상태. `AM`(활동) \| `RM`(수습) \| `CM`(전산) \| `OB`(졸업) |
| `role` | `string` | 역할. `USER` \| `ADMIN` \| `SUPER_ADMIN` |

#### 에러

| HTTP | errorCode | 설명 |
| --- | --- | --- |
| 401 | `INVALID_CREDENTIALS` | 토큰 없음 또는 만료(미로그인) |

### POST /api/v1/auth/reissue

Refresh Token으로 새 Access Token과 Refresh Token을 발급합니다. Access Token이 만료되었을 때 호출합니다. 권장 패턴은 401 수신 후 재발급을 시도하고, 성공하면 원래 요청을 재시도하는 것입니다. 재발급도 401이면 로그인 페이지로 이동하세요.

**호출 주체**: 외부 서비스 프론트엔드 또는 백엔드

#### 요청 헤더

| 헤더 | 필수 | 설명 |
| --- | --- | --- |
| `Client-Type` | 선택 | `WEB`(기본) \| `APP` |
| `Content-Type` | APP 필수 | `application/json` |

#### 요청 본문

**WEB** — 본문 없음. Refresh Token은 `rt` 쿠키에서 자동으로 읽습니다.

**APP**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `refreshToken` | `string` | APP 필수 | Refresh Token |

#### reissue 응답 — 200 OK

**WEB** — 서버가 새 `at`/`rt` 쿠키를 발급합니다. 응답 본문에는 만료 시각과 리다이렉트 URL만 담깁니다.

```json
{
  "accessExpiredTime": 1900000000000,
  "redirectUrl": "https://your-service.com/callback"
}
```

**APP** — 새 토큰을 본문으로 받습니다.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "accessExpiredTime": 1900000000000,
  "redirectUrl": "https://your-service.com/callback"
}
```

| 필드 | 타입 | 포함 | 설명 |
| --- | --- | --- | --- |
| `accessExpiredTime` | `number` | WEB·APP 공통 | Access Token 만료 시각. **Unix epoch 밀리초(ms)** 단위 |
| `redirectUrl` | `string` | WEB·APP 공통 | `client-id`에 등록된 콜백 URL. 재발급 성공 후 이동할 주소입니다. |
| `accessToken` | `string` | APP 전용 | 새 Access Token |
| `refreshToken` | `string` | APP 전용 | 새 Refresh Token |

#### 에러

| HTTP | errorCode | 설명 |
| --- | --- | --- |
| 401 | `REFRESH_TOKEN_MISSING` | Refresh Token이 쿠키(WEB) 또는 본문(APP)에 없음 |
| 401 | `REFRESH_TOKEN_INVALID` | Refresh Token이 만료·무효화되었거나 형식이 올바르지 않음 |

### POST /api/v1/auth/logout

세션을 종료합니다. **멱등** — 이미 로그아웃 상태여도 200을 반환합니다.

**호출 주체**: 외부 서비스 프론트엔드

#### 요청 헤더

| 헤더 | 필수 | 설명 |
| --- | --- | --- |
| `Client-Type` | 선택 | `WEB`(기본) \| `APP` |

#### 요청 본문

없음.

#### logout 응답 — 200 OK

본문 없음.

- **WEB** — 서버가 `at`·`rt` 쿠키를 즉시 만료(`Max-Age=0`)시킵니다.
- **APP** — 서버는 별도 처리를 하지 않습니다. 클라이언트가 보관 중인 Access Token/Refresh Token을 직접 삭제하세요.

#### 에러

없음(멱등).

## 에러 코드

이 문서의 엔드포인트에서 발생하는 에러 코드입니다.

| HTTP | errorCode | 설명 | 발생 엔드포인트 |
| --- | --- | --- | --- |
| 401 | `INVALID_CREDENTIALS` | 토큰이 없거나 만료되었습니다(미로그인). | `me` |
| 401 | `REFRESH_TOKEN_MISSING` | Refresh token이 없습니다. | `reissue` |
| 401 | `REFRESH_TOKEN_INVALID` | 유효하지 않은 Refresh token입니다. | `reissue` |

> 어드민 API에서만 발생하는 에러 코드(`FORBIDDEN`, `INVALID_ROLE` 등)는 이 문서 범위 밖이므로 제외했습니다.

## 관련 문서

- [Quick Start](./quick-start) — 연동 2단계 절차
- [SSO 동작 들여다보기](./sso-integration) — WEB/APP 흐름과 토큰 재발급 메커니즘
- [클라이언트 연동 예시](./client-examples) — 복사해서 쓰는 연동 코드
- [FAQ / 트러블슈팅](./faq) — 자주 겪는 문제와 해결 방법
