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
    ├─ signUp/
    │   └─ index.ts          # POST /api/auth/signup (선택 쿼리: ?code=)
    └─ v1/
        └─ login/
            └─ index.ts      # POST /api/v1/auth/login (SSO 내부 인증용, withCredentials)
```

| 파일 | 엔드포인트 | 비고 |
| --- | --- | --- |
| `src/api/auth/v1/login/index.ts` | `POST /api/v1/auth/login` | SSO 페이지가 ID/PW를 백엔드에 제출할 때 사용. `withCredentials: true` |
| `src/api/auth/signUp/index.ts` | `POST /api/auth/signup` | 선택적 `?code=<sso-auth-code>` 쿼리 |
| `src/api/auth/types.ts` | - | 요청/응답 타입 및 공통 에러 응답 타입 |

> **외부 연동에 노출되는 엔드포인트**(`/api/v1/auth/token/exchange`, `/api/v1/auth/token/refresh`)는 SSO 백엔드가 직접 제공하며, 본 프론트엔드 코드에서는 호출하지 않습니다. 자세한 요청·응답 스키마는 [개발자 가이드 — API 명세](../developers/api-reference)를 참조하세요. *(TBD: 해당 엔드포인트 경로/필드명은 백엔드 확정 시 갱신)*

## 폴더 명명 컨벤션

- **버전 분리**: 새로 추가되는 인증 관련 API는 가능하면 `v1/`, `v2/` 식으로 폴더를 만들어 분리합니다(현재 `login`만 `v1/` 하위에 있고, `signUp`은 비버전 경로).
- **도메인 단위 폴더**: API는 도메인(`auth`, 향후 `member`, `oauth` 등) 단위로 폴더를 나누고, 각 도메인 폴더 안에 엔드포인트별 서브폴더와 `index.ts`를 두는 패턴을 유지합니다.

## 에러 응답 매핑

서버에서 내려주는 에러 코드는 페이지 단위로 가까이 매핑됩니다.

- 로그인 에러 매핑: `src/components/feature/pages/login/LoginFormSection/errorCodeMap.ts`
  - 현재 `4008 → "ID 또는 비밀번호가 일치하지 않습니다"` 한 건만 매핑됨
- 회원가입 에러 매핑: `src/components/feature/pages/sign-up/SignUpFormSection/errorCodeMap.ts`
  - `{ field, message }` 형태로 폼 필드와 에러 메시지를 함께 반환
  - `3001`은 서버 응답 메시지를 그대로 사용(`message: null` 패턴)

> 매핑되지 않은 코드의 처리 정책은 "서버 `message`를 그대로 노출"입니다. 새 에러 코드를 도입할 때는 페이지 단위 `errorCodeMap.ts`와 [개발자 가이드 — 에러 코드](../developers/error-codes)를 함께 갱신하세요.
