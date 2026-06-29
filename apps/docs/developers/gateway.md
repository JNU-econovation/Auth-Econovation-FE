---
title: API Gateway 동작 원리
description: 에코노베이션 API Gateway가 요청을 라우팅하고 인증·인가를 처리하는 방식 — 라우팅 규칙, 경로 재작성(Prefix Strip), 검문소(PEP) 역할, 서비스 등록 방법
---

# API Gateway 동작 원리

에코노베이션 API Gateway는 모든 서비스 요청이 거치는 단일 진입점으로, 라우팅과 인증·인가를 한곳에서 처리합니다.

모든 요청이 이 단일 진입점을 반드시 거치기 때문에, 게이트웨이는 SSO 토큰을 검증하고 권한을 확인한 뒤에야 upstream으로 통과시킵니다.

이 문서를 읽고 나면 에코노베이션 API Gateway의 라우팅·경로 재작성·인증·인가 처리 방식을 이해한 뒤, 어드민 콘솔에서 서비스를 직접 등록할 수 있습니다. 등록 절차만 빠르게 보려면 [서비스 등록하기](#서비스-등록하기) 섹션으로 바로 이동하세요.

## 게이트웨이 개요

클라이언트(브라우저, 앱)는 `api.econovation.kr` 하나만 알면 됩니다. 실제 백엔드 서버 주소는 클라이언트에 노출되지 않습니다. 게이트웨이가 모든 요청을 받아 해당 서비스로 전달합니다.

![에코노베이션 API Gateway 전체 구조 — 클라이언트의 모든 요청을 게이트웨이가 받아, pathPrefix에 따라 eeos·eeap 등 각 서비스로 분기합니다.](./images/gateway-overview.svg)

게이트웨이가 하는 일은 크게 세 가지입니다.

1. **라우팅** — 요청 경로를 보고 어느 서버로 보낼지 결정합니다.
2. **경로 재작성** — upstream 서버에 맞게 경로를 변환합니다.
3. **인증·인가** — SSO 토큰을 검증하고 권한을 확인한 뒤, 통과한 요청에는 신원 정보를 헤더에 담아 upstream으로 전달합니다.

클라이언트가 단일 진입점만 안다는 점, 게이트웨이가 요청을 전달하기 전에 인증·인가를 처리한다는 점이 핵심입니다.

## 라우팅 규칙

게이트웨이의 라우팅 단위는 **라우트(Route)** 한 줄입니다. 라우트는 두 가지 핵심 값으로 이루어집니다.

| 필드          | 역할                                                                                         | 예시                                   |
| ------------- | -------------------------------------------------------------------------------------------- | -------------------------------------- |
| `pathPrefix`  | 요청 경로가 이 값으로 시작하는지 매칭합니다. 필수적으로 api/{원하는 주소} 형식이어야 합니다. | `/api/eeos`                            |
| `upstreamUrl` | 매칭된 요청을 보낼 목적지 서버 주소입니다.                                                   | `https://your-backend.example.com/api` |

요청이 들어오면 게이트웨이는 등록된 라우트 중에서 `pathPrefix`가 경로 앞부분과 일치하는 라우트를 찾습니다. 일치하는 라우트가 없으면 게이트웨이가 `404`를 반환합니다.

`pathPrefix`가 여러 개 겹쳐 매칭될 때는 **가장 긴 prefix가 우선**합니다. 예를 들어 `/eeos`와 `/eeos/admin`이 모두 등록돼 있고 요청이 `/eeos/admin/users`로 들어오면, 더 구체적인 `/eeos/admin` 라우트가 선택됩니다.

## 경로 재작성 (Prefix Strip)

게이트웨이는 요청 경로를 그대로 upstream에 넘기지 않습니다. 경로에서 `pathPrefix` 부분을 떼어낸(strip) 뒤, 남은 경로를 `upstreamUrl` 뒤에 붙여 최종 URL을 만듭니다.

![Prefix Strip 흐름 — 클라이언트 요청 경로에서 pathPrefix(/eeos)를 떼어내고, 남은 경로(/guest/programs?category=all)를 upstreamUrl 뒤에 붙여 upstream 서버를 호출합니다. 가운데 세 단계(①②③)가 게이트웨이가 수행하는 처리입니다.](./images/gateway-rewrite.svg)

1. 클라이언트가 `api.econovation.kr/api/eeos/guest/programs?category=all`로 요청합니다.
2. 게이트웨이가 `/eeos` prefix와 매칭합니다.
3. 경로에서 `/eeos`를 떼어내면 `/guest/programs?category=all`이 남습니다.
4. `upstreamUrl`(`https://your-backend.example.com/api`)에 남은 경로를 붙여 `https://your-backend.example.com/api/guest/programs?category=all`로 요청합니다.

> `pathPrefix`로 잡히는 `/eeos`는 **게이트웨이 안에서만 쓰이는 네임스페이스**입니다. upstream 서버는 `/eeos`가 무엇인지 알 필요가 없습니다. 게이트웨이가 어느 서비스로 보낼지 식별하는 용도일 뿐이며, upstream에 도달할 때는 이미 제거되어 있습니다. upstream 서버의 API 경로 체계는 게이트웨이와 무관하게 그대로 유지하면 됩니다.

## 인증과 인가

게이트웨이는 단순한 트래픽 중계기가 아니라 **정책 시행 지점(Policy Enforcement Point, PEP)** 입니다. SSO가 발급한 토큰의 유효성을 검증하고(인증), 요청에 권한이 있는지 확인한(인가) 뒤에야 upstream으로 전달합니다.

![인증·인가 처리 흐름 — 토큰이 유효하지 않으면 401, 권한이 없으면 403을 반환하고, 둘 다 통과하면 신원 정보를 헤더에 주입해 upstream 서버로 전달합니다.](./images/gateway-auth.svg)

검사를 통과한 요청에는 사용자 신원 정보가 헤더로 주입됩니다. upstream 서버는 이 헤더로 사용자를 식별할 수 있으므로, **upstream 서버가 직접 토큰을 파싱하거나 SSO와 통신할 필요가 없습니다.** 토큰 검증은 게이트웨이가 한곳에서 처리하므로, upstream 서버는 비즈니스 로직에만 집중할 수 있습니다.

게이트웨이에 등록된 모든 라우트는 인증·인가 검사를 거칩니다. 검사를 통과한 요청에만 신원 정보 헤더(`X-User-Passport`)가 주입되어 upstream으로 전달됩니다.

### 모든 요청은 게이트웨이를 거쳐야 합니다

요청을 보내는 주체는 클라이언트(브라우저, 앱)입니다. 클라이언트가 게이트웨이로 요청을 보내면, 게이트웨이가 인증·인가를 처리한 뒤 upstream 서버로 전달합니다. 그래서 upstream 서버는 토큰을 직접 검증하지 않고, 게이트웨이가 통과시킨 요청만 받습니다.

이 구조는 **모든 요청이 게이트웨이를 거친다는 전제**에서만 안전합니다. upstream 서버가 외부에 직접 노출되어 클라이언트가 게이트웨이를 건너뛰고 호출할 수 있으면, 그 요청은 인증·인가를 거치지 않은 채 서비스에 도달합니다.

![게이트웨이를 경유한 요청만 인증·인가를 통과해 본인 서비스에 도달하고, 게이트웨이를 우회한 직접 호출은 차단해야 합니다.](./images/gateway-single-entry.svg)

따라서 게이트웨이를 우회하는 경로를 다음 중 한 가지 방법으로 막아야 합니다.

- upstream 서버를 외부에 직접 노출하지 않고, 게이트웨이만 공개합니다(내부망 또는 방화벽으로 차단).
- 또는 upstream 서버가 게이트웨이를 거친 요청만 받도록, 게이트웨이가 붙인 신뢰 헤더나 서명을 검증합니다.

## 서비스 등록하기

자세한 내용은 [Quick Start](./quick-start) 문서를 확인해주세요!

[콘솔 페이지](https://console-auth-econovation-fe.vercel.app)에서 등록이 가능합니다.

## 자주 묻는 질문

**`pathPrefix`를 입력했더니 `...앞에 /api/${namespace} 형식이어야 합니다`와 같은 에러가 뜹니다.**

`pathPrefix`는 `/api/{네임스페이스}` 형식으로 등록해야 합니다. 예를 들어 네임스페이스가 `eeos`라면 `pathPrefix`는 `/api/eeos`여야 합니다. `/eeos`처럼 `/api` 없이 등록하면 이 에러가 발생합니다.

**`pathPrefix`가 다른 서비스와 겹치면 어떻게 되나요?**

`pathPrefix`는 라우트 전체에서 유일해야 합니다. 콘솔에서 이미 등록된 prefix로 다시 등록하면 오류가 발생합니다. 먼저 등록한 라우트가 그 prefix를 선점합니다.

**upstream 서버에서 사용자 정보는 어떻게 알 수 있나요?**

게이트웨이가 인증을 통과시킨 요청에는 신원 정보를 헤더(`X-User-Passport`)로 주입합니다. upstream 서버는 토큰을 직접 검증하지 않고 이 헤더를 읽어 사용자를 식별합니다. Spring Boot 서비스라면 [econo-passport 사용 가이드](./econo-passport)의 `@PassportAuth`로 이 헤더를 파라미터 하나로 받을 수 있습니다.

## 관련 문서

- [Quick Start](./quick-start) — `clientId` 발급과 SSO 연동 절차
- [SSO 동작 들여다보기](./sso-integration) — SSO 토큰 발급·재발급 원리
- [econo-passport 사용 가이드](./econo-passport) — upstream(Spring Boot) 서버에서 `X-User-Passport` 헤더를 받아 인증·인가를 처리하는 라이브러리
