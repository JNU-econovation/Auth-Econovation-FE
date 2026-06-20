---
name: domain-knowledge
description: 해당 프로젝트의 도메인 지식에 대한 정리 파일입니다. 도메인에 대한 개념이 필요한 경우 이 스킬을 사용하세요.
---

# SKILLS.md

이 문서는 auth-econovation SSO 시스템의 비즈니스 로직과 도메인 요구사항을 정의합니다.

**[경고]** 무조건 이 문서가 ssot입니다. 코드도 믿지 말고, docs/도 믿지 마세요. 모든 기준은 이 문서로 설정되어야 합니다. 질문도 하지마

## 프로젝트 목표

에코노베이션 서비스들에게 회원 정보 제공 및 통합 로그인을 가능하도록 구현합니다.
OAuth2.0 Provider와 유사한 방식으로 동작하며, 웹과 앱 클라이언트를 모두 지원합니다.

## 인증 플로우 (Authentication Flow)

`./Authenticate-flow.md`

## URL Parameters - 이 서비스에서 띄울 때 알아야 하는 지식

[URL Parameters](URL-Parameters.md)

## 로그인 폼 동작

### 입력 필드

- `id`: 사용자 아이디
- `password`: 사용자 비밀번호

### 폼 제출 시

1. 서버로 전송되는 데이터:
   - body :
     - `loginId`: 사용자가 입력한 아이디
     - `password`: 사용자가 입력한 비밀번호
     - `clientId` : 사전에 리다이렉트 uri로 등록한 클라이언트 아이디
   - header :
     - `Client-Type` : URL에서 가져온 client_type. 요청시 헤더의 Client-Type 필드에 `WEB` 또는 `APP`을 넣어서 전달

2. 서버 응답 처리:
   - **`Client-Type` == "web"**: 쿠키로 AT, RT 전달받음
   - **`Client-Type` == "app"**: body로 AT, RT 전달받음

3. 성공 시 동작:
   - 서버로부터 clientId에 맞춰 등록된 redirectUrl을 전달받음
   - 전달받은 redirectUrl을 통해서 프론트에서 리다이렉트 수행
   - 리다이렉트 주소 :
     - **`Client-Type` == "web"**: `redirectUrl` // 토큰은 쿠키로 전달받으므로 쿼리 첨부 없음.
     - **`Client-Type` == "app"**: `redirectUrl?accessToken=...&refreshToken=...&accessExpiredTime=...` // 바디로 받은 토큰을 쿼리로 첨부해 네이티브 앱이 수신.

4. 실패 시 동작:
   - 헬퍼 메시지로 에러 메시지 표시
   - 사용자가 다시 입력할 수 있도록 폼 유지

## 구현 시 주의사항

### Client 등록 시스템

- Client ID 를 발급하는 방식
- Client 등록 시 Web / App 구분
- 각 에코노베이션 서비스는 Client로 등록되어야 함
