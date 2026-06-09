---
title: 환경 변수 · Alias
description: VITE_API_URL과 Vite alias 7종
---

# 환경 변수 · Alias

## 환경 변수

본 레포는 **단일 환경 변수**만 사용합니다.

| 이름 | 용도 | 사용 위치 |
| --- | --- | --- |
| `VITE_API_URL` | 백엔드 API 서버의 base URL. axios 인스턴스의 `baseURL`에 주입됩니다. | `src/api/client.ts` |

### 기본값

`.env` 파일에 다음 한 줄이 정의되어 있습니다.

```bash
VITE_API_URL=https://dev.eeos.econovation.kr/
```

### 타입 선언

`src/vite-env.d.ts`에서 환경 변수 타입이 다음과 같이 선언됩니다.

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 사용 방식

`src/api/client.ts`에서 trailing slash를 정규식으로 제거한 뒤 axios 인스턴스의 `baseURL`로 사용합니다.

```typescript
import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const apiClient = axios.create({ baseURL });
```

> 끝의 `/`를 제거하는 로직은 회귀 방지를 위해 테스트로도 보호되어 있습니다(`src/__tests__/baseURL.test.ts`).

### 환경별 값 관리

| 환경 | 권장 값 |
| --- | --- |
| 로컬 개발 | `.env` 파일의 기본값(`https://dev.eeos.econovation.kr/`) 또는 로컬 백엔드 |
| Vercel Preview | Vercel 프로젝트의 **Preview** 환경 변수로 주입 |
| Production | Vercel 프로젝트의 **Production** 환경 변수로 주입 (예: `https://api.econovation.kr`) |

> Vite는 클라이언트 번들에 포함되는 환경 변수만 `VITE_` 접두사로 노출합니다. 백엔드 시크릿(서명 키 등)은 절대 `VITE_` 접두사를 붙이지 마세요. 본 레포에서는 시크릿을 직접 다루지 않습니다.

## Vite Alias

`vite.config.ts`에 다음 7개의 alias가 정의되어 있습니다. 동일한 alias가 `vitest.config.ts`에도 중복 정의되어 있으므로, alias를 수정하면 **두 파일 모두** 갱신해야 합니다.

| Alias | 매핑 경로 | 주 용도 |
| --- | --- | --- |
| `@` | `./src` | 일반 절대 경로 |
| `@assets` | `./src/assets` | 정적 에셋 |
| `@shared` | `./src/components/common/shared` | 공통 공유 컴포넌트 |
| `@entities` | `./src/components/common/entities` | 도메인 엔티티 컴포넌트 |
| `@pages` | `./src/components/feature/pages` | 페이지 단위 기능 컴포넌트 |
| `@widget` | `./src/components/feature/widget` | 위젯 단위 기능 컴포넌트 |
| `@app` | `./src/app` | 라우트 1:1 페이지 컴포넌트 |

### 주의 사항

- alias를 추가/수정하면 `vite.config.ts` ↔ `vitest.config.ts` 두 곳 모두 동기화하세요. 한쪽만 수정하면 테스트와 런타임 모듈 해석이 어긋납니다.
- `tsconfig.app.json`의 `paths` 설정도 alias와 일치해야 IDE가 import 경로를 인식합니다.
