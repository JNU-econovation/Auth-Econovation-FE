---
title: API 레이어
description: axios 인스턴스 구성과 src/api 트리
---

# API 레이어

## axios 인스턴스 (`src/api/client.ts`)

```typescript
import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const apiClient = axios.create({ baseURL });
```

- **`baseURL`**: 환경 변수 `VITE_API_URL` 값을 사용하고, 끝의 슬래시(`/`)는 정규식으로 제거합니다.
- **`withCredentials`**: 인스턴스 단위로는 설정되어 있지 않습니다. **개별 호출(`signInApi`)에서 `{ withCredentials: true }`** 로 옵션을 주입합니다.
- **인터셉터 / 타임아웃**: 현재 정의되어 있지 않습니다. 토큰 자동 부착, 401 재시도, 공통 에러 변환 등이 필요해지면 이 파일에 추가하는 것을 권장합니다.

## `src/api/` 트리

```
src/api/
├─ client.ts                 # axios 인스턴스
└─ auth/
    ├─ types.ts              # 요청/응답 타입, 공통 에러 응답 타입
    └─ v1/
        ├─ signup/
        │   └─ index.ts      # POST /api/v1/auth/signup (선택 쿼리: ?code=)
        ├─ login/
        │   └─ index.ts      # POST /api/v1/auth/login (SSO 내부 인증용, withCredentials)
        ├─ reissue/
        │   └─ index.ts      # POST /api/v1/auth/reissue (Access Token/Refresh Token 재발급)
        └─ logout/
            └─ index.ts      # POST /api/v1/auth/logout (멱등)
```

| 파일                               | 엔드포인트                  | 비고                                                                  |
| ---------------------------------- | --------------------------- | --------------------------------------------------------------------- |
| `src/api/auth/v1/login/index.ts`   | `POST /api/v1/auth/login`   | SSO 페이지가 ID/PW를 백엔드에 제출할 때 사용. `withCredentials: true` |
| `src/api/auth/v1/signup/index.ts`  | `POST /api/v1/auth/signup`  | 선택적 `?code=<sso-auth-code>` 쿼리. 성공 시 토큰 미발급              |
| `src/api/auth/v1/reissue/index.ts` | `POST /api/v1/auth/reissue` | Access Token 만료 시 Refresh Token으로 재발급                         |
| `src/api/auth/v1/logout/index.ts`  | `POST /api/v1/auth/logout`  | 멱등                                                                  |
| `src/api/auth/types.ts`            | -                           | 요청/응답 타입 및 공통 에러 응답 타입                                 |

> **외부 연동에 노출되는 엔드포인트**(`/api/v1/auth/token/exchange`, `/api/v1/auth/token/refresh`)는 SSO 백엔드가 직접 제공하며, 본 프론트엔드 코드에서는 호출하지 않습니다. 자세한 요청·응답 스키마는 [개발자 가이드 — API 명세](../developers/api-reference)를 참조하세요. _(TBD: 해당 엔드포인트 경로/필드명은 백엔드 확정 시 갱신)_

## 폴더 명명 컨벤션

- **버전 분리**: 인증 관련 API는 `v1/` 하위에 엔드포인트별로 분리합니다(현재 `signup`, `login`, `reissue`, `logout` 모두 `v1/` 하위). 새 버전이 필요하면 `v2/`를 추가합니다.
- **도메인 단위 폴더**: API는 도메인(`auth`, 향후 `member`, `oauth` 등) 단위로 폴더를 나누고, 각 도메인 폴더 안에 엔드포인트별 서브폴더와 `index.ts`를 두는 패턴을 유지합니다.

## 에러 응답 매핑

서버에서 내려주는 에러 응답은 명세(`context/sso-api/common.md`)의
`{ errorCode, message, timestamp }` 형식이며, 페이지 단위로 가까이 매핑됩니다.
키는 문자열 `errorCode`(예: `INVALID_CREDENTIALS`)입니다.

- 로그인 에러 매핑: `src/components/feature/pages/login/LoginFormSection/errorCodeMap.ts`
  - `INVALID_CREDENTIALS`, `VALIDATION_FAILED`를 사용자 메시지로 매핑
- 회원가입 에러 매핑: `src/components/feature/pages/sign-up/SignUpFormSection/errorCodeMap.ts`
  - `{ field, message }` 형태로 폼 필드와 에러 메시지를 함께 반환
  - `MEMBER_ALREADY_EXISTS`(id), `INVALID_PASSWORD_POLICY`(password)를 필드에 매핑
  - `VALIDATION_FAILED`는 특정 필드 정보가 없어 서버 `message`로 안내

> 매핑되지 않은 코드의 처리 정책은 "서버 `message`를 그대로 노출"입니다. 새 에러 코드를 도입할 때는 페이지 단위 `errorCodeMap.ts`와 [개발자 가이드 — API 명세](../developers/api-reference)를 함께 갱신하세요.
