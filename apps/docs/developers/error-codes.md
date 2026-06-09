---
title: 에러 코드
description: 로그인·회원가입·토큰 교환 에러 코드 표와 공통 에러 응답 형식
---

# 에러 코드

## 공통 에러 응답 형식

SSO 백엔드는 모든 에러를 다음 형식으로 반환합니다. `errorCode`는 문자열 식별자이며,
HTTP 상태 코드와 함께 내려옵니다.

```json
{
  "errorCode": "INVALID_CREDENTIALS",
  "message": "아이디 또는 비밀번호가 올바르지 않습니다.",
  "timestamp": "2026-06-03T18:00:00"
}
```

## 공통 에러 코드

| HTTP | errorCode | 상황 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | 필수 필드 누락, 형식 오류 |
| 400 | `INVALID_PASSWORD_POLICY` | 비밀번호 정책 위반 |
| 400 | `REDIRECT_URI_REQUIRED` | `redirectUris` 없음 |
| 400 | `INVALID_ROLE` | 유효하지 않은 역할 값 |
| 401 | `INVALID_CREDENTIALS` | 아이디/비밀번호 불일치 |
| 401 | `REFRESH_TOKEN_MISSING` | RT 없음 |
| 401 | `REFRESH_TOKEN_INVALID` | RT 만료, 형식 오류, AT를 RT 자리에 사용 |
| 403 | `FORBIDDEN` | 역할 부족 |
| 403 | `FORBIDDEN_SELF_ROLE_CHANGE` | 본인 역할 변경 시도 |
| 404 | `NOT_FOUND` | 존재하지 않는 회원 |
| 409 | `MEMBER_ALREADY_EXISTS` | loginId 중복 |
| 409 | `DUPLICATE_RESOURCE` | clientName 중복 |
| 409 | `LAST_SUPER_ADMIN_CANNOT_BE_DEMOTED` | 마지막 SUPER_ADMIN 해제 시도 |

## 토큰 교환 에러

*(TBD: 아래 코드는 제안 사항입니다. 토큰 교환 흐름은 백엔드 확정 후 갱신합니다.)*

| 코드 | 메시지 | 원인 |
| --- | --- | --- |
| `4010` | 등록되지 않은 오리진입니다 | 요청의 `Origin`이 등록 오리진과 불일치 |
| `4011` | 유효하지 않은 임시 토큰입니다 | 토큰 만료, 위변조, 또는 형식 오류 |
| `4012` | 이미 사용된 임시 토큰입니다 | 동일 코드로 재교환 시도 |
| `4013` | 클라이언트 인증 실패 | `client_id` 또는 `client_secret` 불일치 |

## 로그인 에러 (SSO 페이지)

| HTTP | errorCode | 메시지 |
| --- | --- | --- |
| 401 | `INVALID_CREDENTIALS` | 아이디 또는 비밀번호가 올바르지 않습니다. |
| 400 | `VALIDATION_FAILED` | 입력값이 올바르지 않습니다. |

> 위 코드에 매핑되지 않는 에러는 서버 응답의 `message`가 사용자에게 그대로 표시됩니다.

## 회원가입 에러

| HTTP | errorCode | 필드 | 메시지 |
| --- | --- | --- | --- |
| 409 | `MEMBER_ALREADY_EXISTS` | `id` | 이미 사용 중인 아이디입니다. |
| 400 | `INVALID_PASSWORD_POLICY` | `password` | 비밀번호 정책을 위반했습니다. |
| 400 | `VALIDATION_FAILED` | (특정 필드 없음) | 서버 응답 `message`를 그대로 사용 |

> `VALIDATION_FAILED`는 어떤 필드가 잘못됐는지 명세에 포함되지 않으므로, 특정 입력
> 필드에 매핑하지 않고 서버 `message`로 안내합니다.

**관련 코드**

- 로그인 매핑: `src/components/feature/pages/login/LoginFormSection/errorCodeMap.ts`
- 회원가입 매핑: `src/components/feature/pages/sign-up/SignUpFormSection/errorCodeMap.ts`
