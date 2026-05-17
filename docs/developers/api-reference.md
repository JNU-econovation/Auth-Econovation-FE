---
title: API 명세
description: POST /api/v1/auth/token/exchange, POST /api/v1/auth/token/refresh, POST /api/auth/signup 요청·응답 명세
---

# API 명세

> 본 절의 엔드포인트 경로, 필드명, 응답 구조는 일부 항목이 `TBD` 상태입니다. 구현 확정 후 갱신됩니다.

## POST /api/v1/auth/token/exchange

임시 토큰을 AT/RT로 교환합니다.

**요청 헤더**

```
Content-Type: application/json
Origin: https://your-service.com
```

**요청 바디**

```json
{
  "code": "tmp_xxxxxxxxxxxxxxxx",
  "client_id": "your-client-id",
  "client_secret": "your-client-secret"
}
```

**응답 (200 OK)**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "accessExpiredTime": 1711800000,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
  },
  "message": "토큰 교환 성공",
  "code": "2000"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `accessToken` | `string` | JWT 액세스 토큰. |
| `accessExpiredTime` | `number` | AT 만료 시각 (Unix timestamp, 초 단위). |
| `refreshToken` | `string` | 리프레시 토큰. |

**중요한 제약 사항**

- 반드시 **서버 사이드에서** 호출해야 합니다. `client_secret`이 브라우저에 노출되면 안 됩니다.
- 요청의 `Origin` 헤더가 사전에 등록된 오리진과 일치해야 합니다.
- 임시 토큰은 **일회용**입니다. 동일 코드로 두 번 교환할 수 없습니다.

---

## POST /api/v1/auth/token/refresh

리프레시 토큰으로 새 AT를 발급받습니다.

**요청 헤더**

```
Content-Type: application/json
```

**요청 바디**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

**응답 (200 OK)**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "accessExpiredTime": 1711803600,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
  },
  "message": "토큰 갱신 성공",
  "code": "2000"
}
```

> *(TBD: RT 회전 정책이 확정되면 본 절에 명시합니다. 회전이 적용된다면 응답의 `refreshToken`이 매번 갱신되며, 이전 RT는 무효화됩니다.)*

---

## POST /api/auth/signup

회원가입 API.

**요청 헤더**

```
Content-Type: application/json
```

**선택 쿼리 파라미터**

| 파라미터 | 설명 |
| --- | --- |
| `code` | 기존 계정 연결용 SSO 인증 코드 (회원가입 페이지의 `?code=` 와 동일) |

**요청 바디**

```json
{
  "name": "홍길동",
  "id": "hong123",
  "password": "P@ssw0rd!",
  "generation": 10,
  "activeStatus": "am"
}
```

**응답 (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

**관련 코드**: `src/api/auth/signUp/index.ts` (`SIGN_UP_API_PATH`, `signUpApi`)
