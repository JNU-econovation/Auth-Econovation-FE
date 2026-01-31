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

### 웹 클라이언트 (client_type == "web")

1. 사용자가 `auth.econovation.kr`에서 로그인
2. 로그인 성공 시 서버가 쿠키로 AT(Access Token), RT(Refresh Token) 전달
3. authorization_code 발급 없이 쿠키에 토큰 직접 삽입
4. `redirect` query string으로 지정된 원래 서비스 페이지로 즉시 리다이렉트
5. AT, RT를 가진 사용자는 모든 에코노베이션 서비스에 Free Pass

### 앱 클라이언트 (client_type == "app")

1. 사용자가 앱 내 웹뷰에서 `auth.econovation.kr`로 로그인
2. OAuth2.0 방식: 서버가 일회성 `authorization_code`를 body로 발급
3. 프론트엔드가 임시 토큰(`authorization_code`)을 가지고 인증 서버에 다시 요청
4. 서버가 body로 AT, RT 발급
5. 리다이렉트 시 `${redirect}?code={authorization_code}` 형식으로 전달
6. AT, RT를 가진 사용자는 모든 에코노베이션 서비스에 Free Pass

## URL Parameters

### redirect (필수)

- 로그인 성공 후 리다이렉트할 URL
- SSO 페이지 URL에 query string으로 전달됨
- 예: `auth.econovation.kr?redirect=https://service.econovation.kr/dashboard`

### client_type (선택)

- 클라이언트 타입을 구분하는 파라미터
- 가능한 값: `"web"` | `"app"`
- 기본값: `"web"`
- 웹 서비스면 "web", 앱 서비스의 웹뷰면 "app"
- 예: `auth.econovation.kr?redirect=https://...&client_type=app`

## 로그인 폼 동작

### 입력 필드

- `id`: 사용자 아이디
- `password`: 사용자 비밀번호

### 폼 제출 시

1. 서버로 전송되는 데이터:
   - `id`: 사용자가 입력한 아이디
   - `password`: 사용자가 입력한 비밀번호
   - `client_type`: URL에서 가져온 client_type (기본값: "web")

2. 서버 응답 처리:
   - **client_type == "web"**: 쿠키로 AT, RT 전달받음
   - **client_type == "app"**: body로 일회성 `authorization_code` 전달받음

3. 성공 시 동작:
   - **client_type == "web"**: `redirect` URL로 즉시 리다이렉트
   - **client_type == "app"**: `${redirect}?code={authorization_code}`로 리다이렉트

4. 실패 시 동작:
   - 헬퍼 메시지로 에러 메시지 표시
   - 사용자가 다시 입력할 수 있도록 폼 유지

## 구현 시 주의사항

### Client 등록 시스템

- Client ID, Client Secret을 발급하는 방식
- Client 등록 시 Web / App 구분
- 각 에코노베이션 서비스는 Client로 등록되어야 함

### 쿠키 처리 (웹)

- AT (Access Token)
- AT 만료 시간
- RT (Refresh Token)
- 모두 쿠키로 전달

### Body 처리 (앱)

- AT (Access Token)
- AT 만료 시간
- RT (Refresh Token)
- 모두 body로 전달

### 보안 고려사항

- `auth.econovation.kr` 도메인에서만 동작
- HTTPS 사용 필수
- CSRF 공격 방지
- XSS 공격 방지
- Secure, HttpOnly 쿠키 속성 설정 (웹 클라이언트)

## API 엔드포인트 (예상)

```
POST /api/auth/login
Request Body:
{
  "id": "user_id",
  "password": "user_password",
  "client_type": "web" | "app"
}

Response (client_type == "web"):
Set-Cookie: access_token=...; HttpOnly; Secure
Set-Cookie: refresh_token=...; HttpOnly; Secure
Status: 200 OK

Response (client_type == "app"):
Body:
{
  "authorization_code": "temp_code_xyz"
}
Status: 200 OK

Response (실패):
Body:
{
  "error": "Invalid credentials"
}
Status: 401 Unauthorized
```
