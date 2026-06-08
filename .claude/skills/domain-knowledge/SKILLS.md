---
name: domain-knowledge
description: 해당 프로젝트의 도메인 지식에 대한 정리 파일입니다. 도메인에 대한 개념이 필요한 경우 이 스킬을 사용하세요.
---

# SKILLS.md

이 문서는 auth-econovation SSO 시스템의 비즈니스 로직과 도메인 요구사항을 정의합니다.

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
     - `id`: 사용자가 입력한 아이디
     - `password`: 사용자가 입력한 비밀번호
   - header :
     - `Client-Type` : URL에서 가져온 client_type. 요청시 헤더의 Client-Type 필드에 `WEB` 또는 `APP`을 넣어서 전달
   - query parameter :
     - `client-id` : 사전에 리다이렉트 uri로 등록한 클라이언트 아이디

2. 서버 응답 처리:
   - **client_type == "web"**: 쿠키로 AT, RT 전달받음
   - **client_type == "app"**: body로 AT, RT 전달받음

3. 성공 시 동작:
   - 서버에서 등록된 리다이렉트 주소로 리다이렉트 시킴

4. 실패 시 동작:
   - 헬퍼 메시지로 에러 메시지 표시
   - 사용자가 다시 입력할 수 있도록 폼 유지

## 구현 시 주의사항

### Client 등록 시스템

- Client ID, Client Secret을 발급하는 방식
- Client 등록 시 Web / App 구분
- 각 에코노베이션 서비스는 Client로 등록되어야 함
