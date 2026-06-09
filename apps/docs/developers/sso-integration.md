---
title: SSO 로그인 연동
description: 전체 흐름, 로그인 페이지 URL과 쿼리 파라미터, 콜백 임시 토큰 수신, 서버 사이드 토큰 교환, 오리진 검증
---

# SSO 로그인 연동

본 SSO는 **임시 토큰 교환(Authorization Code Exchange) 방식**을 사용합니다. AT/RT가 브라우저 URL에 직접 노출되지 않으며, 사전에 등록된 오리진에서만 토큰 교환이 허용됩니다.

## 전체 흐름

```
[클라이언트 서비스]                [브라우저]                   [SSO 프론트엔드]            [SSO 백엔드]
       │                              │                              │                          │
       │   (1) 로그인 버튼 클릭        │                              │                          │
       │ ◄────────────────────────── │                              │                          │
       │                              │                              │                          │
       │   (2) SSO 페이지로 이동       │                              │                          │
       │ ────────────────────────►   │ ──────────────────────────► │                          │
       │                              │                              │                          │
       │                              │   (3) ID/PW 입력 및 제출     │                          │
       │                              │ ────────────────────────► │ ───────────────────────► │
       │                              │                              │                          │
       │                              │                              │   (4) 임시 토큰 발급     │
       │                              │                              │ ◄────────────────────── │
       │                              │                              │                          │
       │                              │   (5) 콜백 URL로 리다이렉트                              │
       │                              │       (?code=<임시토큰>)                                 │
       │                              │ ◄──────────────────────────────────────────────────── │
       │                              │                              │                          │
       │   (6) 콜백 페이지 진입        │                              │                          │
       │ ◄────────────────────────── │                              │                          │
       │                              │                              │                          │
       │   (7) 서버로 code 전달        │                              │                          │
       │       (브라우저 → 자체 서버)  │                              │                          │
       │                              │                              │                          │
       │   (8) 토큰 교환 요청 (서버 ↔ SSO 백엔드)                                                 │
       │ ─────────────────────────────────────────────────────────────────────────────────► │
       │                              │                              │                          │
       │                              │       (9) 오리진 검증 + AT/RT 발급                       │
       │ ◄───────────────────────────────────────────────────────────────────────────────── │
       │                              │                              │                          │
       │   (10) 클라이언트로 세션 응답                                                            │
       │ ──────────────────────────► │                              │                          │
```

핵심 포인트입니다.

- **(5) 리다이렉트는 SSO 백엔드가 수행**합니다. 프론트엔드 SPA가 토큰을 들고 이동하는 방식이 아닙니다.
- **(8) 토큰 교환은 반드시 서버 사이드에서** 호출하세요. `client_secret`이 노출되면 안 됩니다.
- **(9) 오리진 검증**은 요청 헤더의 `Origin` 또는 `Referer`를 기준으로 수행됩니다. *(TBD: 검증 기준 헤더 확정 시 갱신)*

## 1) 로그인 페이지로 보내기

사용자를 SSO 로그인 페이지로 이동시킵니다.

```
https://auth.econovation.kr/?redirect-url=<your-callback-url>
```

### 쿼리 파라미터

| 파라미터 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| `redirect-url` | 필수 | `string` | 로그인 성공 후 SSO 백엔드가 임시 토큰을 붙여 리다이렉트할 URL. `http://` 또는 `https://`로 시작하는 절대 URL이어야 합니다. |

### redirect-url 검증 규칙

`redirect-url`은 다음 두 조건을 만족해야 합니다.

- `http://` 또는 `https://` 프로토콜로 시작
- `new URL(redirectUrl)`로 파싱 가능한 형식

조건을 만족하지 않으면 로그인 페이지에 **"유효하지 않은 리다이렉트 URL"** 메시지가 표시되고 리다이렉트가 수행되지 않습니다.

```typescript
// 내부적으로 다음과 같이 검증됩니다.
const isValidRedirectUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
```

> `redirect-url`의 호스트는 **등록 오리진과 일치하지 않아도 됩니다**. 오리진 검증은 토큰 교환 단계에서 수행됩니다. 다만 운영상 보안을 위해 등록 오리진과 동일 도메인을 사용하는 것을 권장합니다.

## 2) 콜백에서 임시 토큰 받기

로그인 성공 시 SSO 백엔드가 `redirect-url`에 임시 토큰을 붙여 리다이렉트합니다.

```
https://your-service.com/auth/callback?code=<임시토큰>
```

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `code` | `string` | 일회용 임시 토큰. 한 번 교환에 사용하면 무효화됩니다. |

*(TBD: 임시 토큰 수명은 확정 시 갱신합니다. 일반적으로 60초 이내를 권장합니다.)*

### React 콜백 핸들러 예시

```tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = params.get("code");

    if (!code) {
      navigate("/login?error=missing-code", { replace: true });
      return;
    }

    // 자체 백엔드로 code 전달, 백엔드가 SSO 백엔드와 교환
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

## 3) 임시 토큰을 AT/RT로 교환하기

서버에서 SSO 백엔드의 토큰 교환 엔드포인트를 호출합니다. 자세한 스펙은 [API 명세](./api-reference#post-apiv1authtokenexchange)를 참고하세요.

**중요한 제약 사항**입니다.

- 반드시 **서버 사이드에서** 호출해야 합니다. `client_secret`이 브라우저에 노출되면 안 됩니다.
- 요청의 `Origin` 헤더가 사전에 등록된 오리진과 일치해야 합니다.
- 임시 토큰은 **일회용**입니다. 동일 코드로 두 번 교환할 수 없습니다.

## 4) AT 만료 시 RT로 갱신하기

AT는 비교적 짧은 수명을 가집니다. 만료되면 RT를 사용해 새 AT를 발급받습니다.

```typescript
const response = await fetch("https://auth.econovation.kr/api/v1/auth/token/refresh", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refreshToken: storedRefreshToken }),
});
```

*(TBD: AT/RT 수명, RT 회전(rotation) 적용 여부는 확정 시 갱신합니다.)*

## 오리진 등록

토큰 교환 요청은 사전에 등록된 오리진에서만 허용됩니다.

### 등록 단위

오리진은 다음 형식으로 등록합니다.

```
<scheme>://<host>[:<port>]
```

예시입니다.

- `https://your-service.com` ✅
- `https://api.your-service.com` ✅ (서브도메인은 별도 등록)
- `http://localhost:3000` ✅ (로컬 개발용으로 등록 가능)
- `https://your-service.com/auth` ❌ (path는 포함하지 않음)

서로 다른 환경(개발/스테이징/프로덕션)을 사용한다면 각각 별도로 등록해야 합니다.

### 등록 신청 방법

*(TBD: 등록 신청 방식이 확정되면 본 절을 갱신합니다. 다음 중 하나가 될 예정입니다.)*

- 어드민 페이지를 통한 셀프 등록
- 운영자에게 슬랙/이메일 신청 후 수동 등록
- 깃 저장소에 PR로 신청

신청 시 다음 정보를 함께 전달하세요.

- 서비스명
- 등록할 오리진 목록 (개발/스테이징/프로덕션 환경 구분)
- 콜백 URL 패턴
- 담당자 연락처

### 발급 정보

등록이 완료되면 다음 정보를 발급받습니다.

- `client_id` — 클라이언트 식별자. 공개되어도 무방합니다.
- `client_secret` — 토큰 교환 시 사용하는 비밀 키. **외부에 노출되면 즉시 재발급을 요청하세요.**
