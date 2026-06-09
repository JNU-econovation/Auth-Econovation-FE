---
title: 토큰 사용 가이드
description: 토큰별 취급 원칙, 저장 위치 권장, 임시 토큰·만료·리프레시 처리
---

# 토큰 사용 가이드

본 SSO는 임시 토큰 교환 방식을 사용하며, 토큰별로 노출 가능한 범위가 다릅니다.

## 토큰별 취급 원칙

| 토큰 | 노출 가능 위치 | 절대 금지 |
| --- | --- | --- |
| 임시 토큰 (`code`) | URL 쿼리스트링 (수명이 짧으므로 허용) | 로그에 평문 기록, 재사용 |
| `accessToken` | `Authorization` 헤더 | URL, localStorage(권장X), 로그 |
| `refreshToken` | HttpOnly 쿠키 또는 서버 측 저장소 | 브라우저 JS에서 접근 가능한 위치 |
| `client_secret` | 서버 환경 변수 | 프론트엔드 번들, 깃 저장소, 클라이언트 코드 |

## 토큰 저장 위치 권장

| 환경 | 권장 저장소 |
| --- | --- |
| 웹 (BFF 패턴) | `HttpOnly` + `Secure` + `SameSite=Lax` 쿠키 |
| 웹 (SPA 단독) | AT는 메모리, RT는 서버 측 세션 |
| 모바일 앱 | Keychain (iOS) / EncryptedSharedPreferences (Android) |

## 임시 토큰 처리

- 임시 토큰은 **일회용**입니다. 한 번 교환에 성공하면 즉시 무효화됩니다.
- 수명이 매우 짧습니다. 콜백 수신 즉시 교환을 시도하세요. *(TBD: 정확한 수명)*
- 동일 임시 토큰으로 두 번째 교환을 시도하면 `4011 INVALID_CODE` 에러가 반환됩니다.

## 인증 헤더

토큰을 발급받은 뒤 서비스 자체 API에 요청할 때는 다음 헤더를 포함하세요.

```
Authorization: Bearer <accessToken>
```

## 만료 시간 처리

`accessExpiredTime`은 **초 단위 Unix timestamp**입니다. JavaScript의 `Date`는 밀리초 단위이므로 변환에 주의하세요.

```typescript
const isExpired = (expiredTimeSec: number): boolean => {
  const nowMs = Date.now();
  const expiresAtMs = expiredTimeSec * 1000;
  return nowMs >= expiresAtMs;
};
```

만료 직전(예: 30초 전)에 미리 갱신을 트리거하는 방식을 권장합니다.

## 리프레시 전략

AT 만료 시 RT로 새 AT를 발급받습니다. 자세한 엔드포인트 스펙은 [API 명세](./api-reference#post-apiv1authtokenrefresh)를 참고하세요.

```typescript
const response = await fetch("https://auth.econovation.kr/api/v1/auth/token/refresh", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refreshToken: storedRefreshToken }),
});
```

*(TBD: AT/RT 수명, RT 회전(rotation) 적용 여부는 확정 시 갱신합니다. 회전이 적용된다면 응답의 `refreshToken`이 매번 갱신되며, 이전 RT는 무효화됩니다.)*

## 오리진 검증

토큰 교환 요청은 다음 검증을 거칩니다.

- 요청의 `Origin` 헤더가 등록된 오리진과 정확히 일치해야 합니다.
- `client_id`와 등록 오리진이 매칭되어야 합니다.
- `client_secret`이 일치해야 합니다.

세 가지 중 하나라도 불일치 시 교환이 거부됩니다.
