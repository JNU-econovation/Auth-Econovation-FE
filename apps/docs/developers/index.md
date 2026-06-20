---
title: 서비스 개요
description: auth-econovation SSO 서비스 개요와 동작 방식
---

# 서비스 개요

**auth-econovation**은 에코노베이션 서비스들에게 통합 로그인(SSO)을 제공하는 인증 프론트엔드입니다. OAuth2.0 Provider와 유사한 방식으로 동작하며, 사용자는 한 번 로그인하면 연결된 모든 서비스에서 동일한 계정으로 인증됩니다.

외부 서비스는 사용자를 SSO 페이지로 보낼 때 자신의 **클라이언트 ID**(`client-id`)와 **클라이언트 타입**(`client-type`)을 쿼리로 전달합니다. 사용자가 로그인에 성공하면, SSO 백엔드는 해당 `client-id`에 **사전 등록된 콜백 주소(`redirectUrl`)** 를 응답으로 내려주고, 프론트엔드가 그 주소로 전체 페이지를 이동시킵니다.

| 항목 | 값 |
| --- | --- |
| 프로덕션 SSO URL | `https://auth.econovation.kr` |
| 개발(Staging) SSO URL | *(TBD: 별도 dev 프론트 도메인 미확정)* |
| 백엔드 API 호스트 | 환경 변수 `VITE_API_URL`로 주입 (개발 기본값 `https://dev.eeos.econovation.kr/`) |
| 진입 쿼리 파라미터 | `client-id`(필수), `client-type`(`web` \| `app`, 기본 `web`) |
| 토큰 발급 방식 | **WEB**: AT/RT를 HttpOnly 쿠키로 발급 · **APP**: AT/RT를 응답 바디로 반환 |
| 로그인 후 이동 | 서버가 내려준 `redirectUrl`(클라이언트 콜백 주소)로 프론트엔드가 전체 페이지 이동 |

> 인증 서버(백엔드)의 실제 API 호스트는 환경 변수 `VITE_API_URL`로 주입됩니다. 이 값은 SSO 프론트엔드가 호출하는 백엔드 주소이며, 위 "SSO URL"(사용자가 접속하는 프론트엔드 페이지)과는 구분됩니다.

## 로그인 동작 방식

본 SSO는 별도의 authorization code 교환 단계 없이, 로그인 요청에 대한 응답으로 **토큰을 직접 발급**합니다. 클라이언트 타입에 따라 토큰 전달 매체가 달라집니다.

1. 외부 서비스가 사용자를 SSO 페이지로 이동시키며 `client-id`(필수)와 `client-type`(선택)을 쿼리로 전달합니다.
2. 사용자가 로그인 폼을 제출하면 프론트엔드가 `POST /api/v1/auth/login`을 호출합니다.
   - 요청 바디: `{ loginId, password, clientId }`
   - 요청 헤더: `Client-Type: WEB` 또는 `APP` (쿼리 `client-type`을 대문자로 변환)
3. SSO 백엔드가 인증에 성공하면 클라이언트 타입에 맞춰 토큰을 발급합니다.
   - **WEB**: AT(Access Token)/RT(Refresh Token)를 **HttpOnly 쿠키**로 발급합니다. 응답 바디에는 `accessExpiredTime`과 `redirectUrl`만 포함됩니다.
   - **APP**: AT/RT를 **응답 바디**(`accessToken` / `refreshToken`)로 반환합니다. 응답에는 `accessExpiredTime`과 `redirectUrl`도 포함됩니다.
4. 프론트엔드는 응답으로 받은 `redirectUrl`로 `window.location`을 통해 **전체 페이지를 이동**시킵니다. 이 `redirectUrl`은 `client-id`에 사전 등록된 클라이언트의 콜백/복귀 주소로, 대개 SSO 페이지와 다른 오리진입니다.

## 토큰 보안 측면

- **WEB 클라이언트**는 AT/RT를 HttpOnly 쿠키로 받으므로 자바스크립트에서 토큰에 접근할 수 없고, URL에도 노출되지 않습니다. 모든 인증 요청은 `withCredentials: true`(쿠키 자동 전송)로 동작합니다.
- **APP 클라이언트(웹뷰)** 는 토큰을 응답 바디로 직접 수령하여 앱 내부에서 가공·보관합니다.
- 콜백 주소는 임의로 지정되지 않으며, **`client-id`에 사전 등록된 `redirectUrl`만** 서버가 응답으로 내려줍니다.

## 다음으로

- [Quick Start](./quick-start) — 가장 단순한 웹 서비스 연동을 세 단계로
- [SSO 동작 들여다보기](./sso-integration) — 전체 흐름·쿼리 파라미터·로그인 후 리다이렉트 상세
- [API 명세](./api-reference) — 로그인/재발급 엔드포인트
- [클라이언트 예시](./client-examples) — 콜백 주소에서의 후속 처리 예제

## 관련 소스 코드 위치

| 영역 | 파일 |
| --- | --- |
| 로그인 API 호출 | `packages/api/src/auth/v1/login/index.ts` |
| 회원가입 API 호출 | `packages/api/src/auth/v1/signup/index.ts` |
| 공통 타입 정의 | `packages/api/src/auth/types.ts` |
| API 클라이언트(axios 인스턴스) | `packages/api/src/client.ts` |
| 로그인 폼/제출 처리 | `apps/web/src/components/feature/pages/login/LoginFormSection/index.tsx` |
| 로그인 후 리다이렉트 | `apps/web/src/lib/redirectToClient.ts` |
| 회원가입 폼 | `apps/web/src/components/feature/pages/sign-up/SignUpFormSection/index.tsx` |
| 비밀번호 검증 규칙 | `apps/web/src/components/feature/pages/sign-up/SignUpFormSection/validatePassword.ts` |
| 로그인 에러 코드 매핑 | `apps/web/src/components/feature/pages/login/LoginFormSection/errorCodeMap.ts` |
| 회원가입 에러 코드 매핑 | `apps/web/src/components/feature/pages/sign-up/SignUpFormSection/errorCodeMap.ts` |
| 라우팅 | `apps/web/src/App.tsx` (`/` → 로그인, `/sign-in` → 회원가입) |
