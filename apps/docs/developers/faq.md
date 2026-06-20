---
title: FAQ / 트러블슈팅
description: 개발자가 자주 겪는 질문과 해결 방법
---

# FAQ / 트러블슈팅

SSO 연동 중 자주 마주치는 문제와 해결 방법을 정리했습니다. 진입 파라미터 설정부터 토큰 수신, 에러 처리, 로컬 개발 환경까지 단계별로 다룹니다.

## URL 파라미터

### SSO 페이지 진입에 필요한 URL 파라미터

`client-id`(필수)와 `client-type`(선택)을 쿼리스트링으로 전달합니다.

- `client-id`: 사전에 등록한, 리다이렉트 URL에 매핑되는 클라이언트 ID
- `client-type`: `web` 또는 `app` (미지정 시 `web`으로 처리)

예: `https://auth.econovation.kr/?client-id=<발급받은_ID>&client-type=app`

### `client-id`를 빠뜨리면 발생하는 문제

로그인 폼은 쿼리에서 `client-id`를 읽어 로그인 요청 바디의 `clientId`로 전송합니다. `client-id`가 누락되면 빈 값으로 전송됩니다. 서버는 `clientId`를 기준으로 `redirectUrl`을 결정하므로, 누락 시 로그인과 리다이렉트가 정상 동작하지 않습니다. SSO 진입 URL에 반드시 `client-id`를 포함하세요.

### `client-type=app`을 지정하는 경우

일반 웹 서비스는 생략하면 됩니다(`web`으로 처리). 앱 내 웹뷰에서 SSO 페이지를 띄우는 경우 `client-type=app`을 지정하세요. WEB과 APP은 토큰을 받는 방식이 다릅니다([토큰 수신 방식](#토큰-수신-방식) 참고).

## 로그인 후 리다이렉트

### 로그인 성공 후 원래 서비스로 돌아가지 않는 경우

이동할 주소는 클라이언트가 파라미터로 넘기는 값이 아니라, 로그인 성공 시 **서버가 응답 바디의 `redirectUrl`로 내려주는 값**입니다. 프론트엔드는 이 `redirectUrl`이 있을 때만 해당 주소로 전체 페이지를 이동합니다. 돌아가지 않는다면, 사용한 `client-id`에 매핑된 `redirectUrl`이 서버에 올바르게 등록되어 있는지 확인하세요.

## 토큰 수신 방식

### APP(웹뷰)에서 토큰 수신하는 방법

APP은 액세스 토큰(AT)/리프레시 토큰(RT)을 응답 바디(`accessToken`/`refreshToken`)로 받습니다. 프론트엔드는 이 토큰들과 `accessExpiredTime`을 서버가 응답한 `redirectUrl`에 쿼리로 붙여 이동합니다. 커스텀 스킴 콜백(예: `econoapp://callback`)도 지원하므로, 네이티브 앱이 해당 콜백 URL의 쿼리에서 토큰을 읽으면 됩니다.

```
econoapp://callback?accessToken=...&refreshToken=...&accessExpiredTime=...
```

### WEB에서 리다이렉트 URL에 토큰이 보이지 않는 경우

정상입니다. WEB은 AT/RT를 HttpOnly 쿠키로 발급받으므로 URL에 토큰이 첨부되지 않습니다. 서버가 응답한 `redirectUrl`로 이동하며, 교차 출처 이동 시 브라우저가 쿠키를 함께 전송합니다.

## 에러 처리

### 로그인 실패 시 에러 형태

SSO 백엔드는 문자열 `errorCode`로 에러를 반환합니다(예: `INVALID_CREDENTIALS`, `VALIDATION_FAILED`). 프론트엔드는 알려진 코드를 사용자 메시지로 매핑하고, 매핑되지 않은 코드는 서버 응답의 `message`를 그대로 표시합니다. 엔드포인트별 에러 코드는 [API 명세](./api-reference)를 참고하세요.

## 로컬 개발 환경

### 로컬 환경(`http://localhost:3000`)에서 테스트하는 방법

개발 모드에서는 `/`로 바로 진입해 `client-id`/`client-type` 쿼리가 비어 있어도 됩니다. `.env`의 `VITE_DEV_CLIENT_ID`·`VITE_DEV_CLIENT_TYPE` 값으로 누락된 쿼리를 자동 보정해 로그인 흐름을 테스트할 수 있습니다. 이 보정은 개발 모드에서만 동작하며, 운영 빌드에는 적용되지 않습니다. 설정 예시는 `apps/web/.env.example`을 참고하세요.

## 정책 및 기타

### SSO 페이지를 거치지 않고 자체 로그인 UI를 만들어도 되는지

권장하지 않습니다. 이 SSO의 핵심 가치(중앙 인증·세션 일관성)는 SSO 페이지가 인증 UI를 단일하게 제공하는 데 있습니다. 각 서비스가 별도 로그인 UI를 두면 이 일관성이 깨집니다.

### 토큰 페이로드(`sub`, `exp`, `role` 등) 구성

JWT 페이로드 정의는 인증 백엔드 명세를 참고하세요. 프론트엔드는 토큰을 직접 디코딩하거나 가공하지 않습니다(WEB은 쿠키로, APP은 콜백 URL을 통해 네이티브 앱으로 전달).
