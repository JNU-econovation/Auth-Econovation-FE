---
title: 서비스 개요
description: auth-econovation SSO 서비스 개요와 동작 방식
---

# 서비스 개요

**auth-econovation**은 에코노베이션 서비스들에게 통합 로그인(SSO)을 제공하는 인증 프론트엔드입니다. OAuth2.0 Provider와 유사한 방식으로 동작하며, 사용자는 한 번 로그인하면 연결된 모든 서비스에서 동일한 계정으로 인증됩니다.

본 SSO는 **임시 토큰 교환(Authorization Code Exchange) 방식**을 사용합니다. 사용자의 액세스 토큰(AT)과 리프레시 토큰(RT)이 브라우저 URL에 직접 노출되지 않으며, 사전에 등록된 오리진(Origin)에서만 토큰 교환이 허용됩니다.

| 항목 | 값 |
| --- | --- |
| 프로덕션 SSO URL | `https://auth.econovation.kr` |
| 개발(Staging) SSO URL | `https://dev.eeos.econovation.kr` (환경에 따라 상이) |
| 토큰 전달 방식 | 콜백 URL에 일회용 임시 토큰(`code`) → 서버 사이드 교환으로 AT/RT 수령 |
| 오리진 검증 | 토큰 교환 요청 시 사전 등록된 오리진만 허용 |

> 인증 서버(백엔드)의 실제 API 호스트는 환경 변수 `VITE_API_URL`로 주입됩니다. 외부 서비스는 보통 직접 인증 API를 호출하지 않고 **SSO 페이지를 통한 임시 토큰 수신 → 서버 사이드 교환** 방식을 사용합니다.

## 왜 임시 토큰 교환 방식인가

AT/RT를 콜백 URL의 쿼리스트링으로 직접 전달하면, 토큰이 브라우저 히스토리, Referer 헤더, 서버 액세스 로그에 평문으로 남습니다. 본 SSO는 이를 방지하기 위해 다음 절차를 사용합니다.

1. SSO 백엔드가 **수명이 짧은 임시 토큰**을 발급해 콜백으로 리다이렉트합니다.
2. 서비스의 **서버**가 임시 토큰을 받아 SSO 백엔드와 직접 통신해 AT/RT로 교환합니다.
3. 교환 시점에 SSO 백엔드가 **요청 오리진이 사전 등록된 출처인지** 확인합니다.

이 구조에서는 URL에는 일회용 임시 토큰만 노출되고, 실제 AT/RT는 서버 간 통신으로만 전달됩니다.

## 다음으로

- [Quick Start](./quick-start) — 가장 단순한 웹 서비스 연동을 세 단계로
- [SSO 로그인 연동](./sso-integration) — 전체 흐름·쿼리 파라미터·콜백·오리진 검증 상세
- [API 명세](./api-reference) — 토큰 교환/갱신 엔드포인트
- [클라이언트 예시](./client-examples) — 콜백 처리와 자체 백엔드 교환 예제

## 관련 소스 코드 위치

| 영역 | 파일 |
| --- | --- |
| 로그인 API 호출 | `src/api/auth/v1/login/index.ts` |
| 회원가입 API 호출 | `src/api/auth/v1/signup/index.ts` |
| 공통 타입 정의 | `src/api/auth/types.ts` |
| 로그인 폼/콜백 처리 | `src/components/feature/pages/login/LoginFormSection/index.tsx` |
| 회원가입 폼 | `src/components/feature/pages/sign-up/SignUpFormSection/index.tsx` |
| 비밀번호 검증 규칙 | `src/components/feature/pages/sign-up/SignUpFormSection/validatePassword.ts` |
| 로그인 에러 코드 매핑 | `src/components/feature/pages/login/LoginFormSection/errorCodeMap.ts` |
| 회원가입 에러 코드 매핑 | `src/components/feature/pages/sign-up/SignUpFormSection/errorCodeMap.ts` |
| 라우팅 | `src/App.tsx` (`/` → 로그인, `/sign-in` → 회원가입) |
