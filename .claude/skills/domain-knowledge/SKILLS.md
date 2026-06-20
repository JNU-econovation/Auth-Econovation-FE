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

## SSO 인증 플로우 (Authentication Flow)

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

## 클라이언트 등록 (Client Registration)

SSO에 연동하기 전에 **Client로 등록**되어야 하며, 등록 시 `clientId`를 발급받습니다.
`clientId`는 SSO 진입 URL의 `client-id` 쿼리로 사용되고, 백엔드는 이 값으로 콜백 URL(`redirectUrl`)을 결정합니다.

### 등록 모델

클라이언트 레코드는 다음 3개 필드로 구성됩니다. (`AdminClient` 타입 / mock `ClientRecord` 기준)

| 필드           | 타입       | 제약                          | 설명                 |
| -------------- | ---------- | ----------------------------- | -------------------- |
| `clientId`     | `string`   | 서버 발급(UUID 형태)          | 클라이언트 식별자    |
| `clientName`   | `string`   | 빈 문자열 불가, **중복 불가** | 표시용 서비스 이름   |
| `redirectUris` | `string[]` | **1개 이상 필수**             | 등록된 콜백 URL 목록 |

> 현재 코드 모델에는 `grantType`·`PKCE`·`clientSecret`·`client-type`(web/app) 필드가 **없습니다.** 모델은 위 3개 필드가 전부입니다.

### 등록 엔드포인트

코드에 실제 구현된 등록 경로는 **관리자 등록 1종**입니다.

`POST /api/v1/admin/clients` — `ADMIN` 이상 권한 필요

- 요청 바디: `{ clientName, redirectUris }`
- 성공 `201`: `{ clientId }` — **`clientSecret`은 반환하지 않습니다.**
- 검증 순서 (mock 핸들러 기준):
  1. `ADMIN`+ 아님 → `403 FORBIDDEN`
  2. `redirectUris` 누락·빈 배열·문자열 아님 → `400 REDIRECT_URI_REQUIRED`
  3. `clientName` 빈 문자열·비문자열 → `400 VALIDATION_FAILED`
  4. `clientName` 중복 → `409 DUPLICATE_RESOURCE`

### redirectUri 관리 (등록 후, `ADMIN`+)

| Method   | Endpoint                                         | 바디       | 동작                                    |
| -------- | ------------------------------------------------ | ---------- | --------------------------------------- |
| `GET`    | `/api/v1/admin/clients/{clientId}`               | -          | 조회 (`clientName`·`redirectUris` 포함) |
| `POST`   | `/api/v1/admin/clients/{clientId}/redirect-uris` | `{ uri }`  | 단건 추가 (멱등: 중복 URI는 무시)       |
| `DELETE` | `/api/v1/admin/clients/{clientId}/redirect-uris` | `{ uri }`  | 단건 삭제                               |
| `PUT`    | `/api/v1/admin/clients/{clientId}/redirect-uris` | `{ uris }` | 목록 전체 교체                          |

- 변경 응답 공통: `{ clientId, redirectUris }`
- 존재하지 않는 `clientId` → `404 NOT_FOUND`, 권한 부족 → `403 FORBIDDEN`

### 콘솔 등록 폼 동작 (`apps/console` `ClientCreateForm`)

- `clientName`: 비어 있으면 제출 차단
- `redirectUris`: 최소 1개. 제출 시 빈 행 제거 + **중복 제거(Set)** 후 전송
- URI 클라이언트 검증: `new URL()` 파싱 성공해야 함. `https://`가 아니면 **경고만**(차단 안 함)
- 성공 시: 발급된 `clientId`를 모달로 노출 → 상세 페이지로 이동
- 에러 매핑: `DUPLICATE_RESOURCE` → 이름 필드 에러 / `REDIRECT_URI_REQUIRED` → 목록 에러
- 안내 문구: 등록되지 않은 URI로의 로그인은 차단됨

### 목록 조회 (명세 미확정)

`GET /api/v1/admin/clients`(전체 목록)는 **백엔드 명세 미확정**입니다. 현재 mock은 전체 배열 반환을 가정하며,
콘솔은 `CLIENTS_LIST_MODE`(`"table"` | `"lookup"`) 상수로 정식 테이블 뷰와 `clientId` 단건 조회 임시 뷰를 전환합니다.

### 코드 ↔ 문서 불일치 (백엔드 확정 시 정리 필요)

작성 시점 기준, `context/api-docs`(명세)와 실제 코드가 다음에서 어긋납니다.

1. **셀프 등록 엔드포인트**: 명세(`clients-self-register.md`)는 `POST /api/v1/clients`(인증 회원 본인, `clientSecret` 1회 반환, **회원당 최대 5개**, `CLIENT_LIMIT_EXCEEDED`)를 정의하지만 **코드에는 미구현**입니다. 코드는 admin 등록만 있고 `clientSecret` 개념 자체가 없습니다.
2. **PKCE / authorization_code**: 명세는 "`authorization_code`(PKCE) 고정"이라고 하지만 코드 모델에는 관련 필드가 없습니다. 또한 개발자 문서(`apps/docs/.../quick-start.md`)는 "authorization code 교환이 없는 **직접 토큰 발급**"이라고 하여 문서끼리도 충돌합니다.
3. **중복 이름 에러 코드**: 명세는 `DUPLICATE_CLIENT_NAME`, 코드(mock + 콘솔)는 `DUPLICATE_RESOURCE`(409, "이미 사용 중인 clientName입니다.")를 사용합니다.
4. **Web/App 구분 시점**: 기존 SSOT 스텁은 "등록 시 Web/App 구분"이라고 했으나, 코드·문서 모두 web/app은 **등록 속성이 아니라 로그인 런타임의 `client-type` 파라미터**입니다. → 본 개정에서 정정했습니다.

## 구현 시 주의사항

### Client 등록 시스템

- 각 에코노베이션 서비스는 Client로 등록되어야 함
- 등록 시 `clientId`를 발급하며, web/app 구분은 등록이 아니라 로그인 시 `client-type`으로 처리함
- 상세는 위 [클라이언트 등록](#클라이언트-등록-client-registration) 절 참조
