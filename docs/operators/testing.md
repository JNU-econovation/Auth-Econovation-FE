---
title: 테스트
description: vitest 설정과 src/__tests__/ 구성
---

# 테스트

## 설정 파일 (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@shared": path.resolve(__dirname, "./src/components/common/shared"),
      "@entities": path.resolve(__dirname, "./src/components/common/entities"),
      "@pages": path.resolve(__dirname, "./src/components/feature/pages"),
      "@widget": path.resolve(__dirname, "./src/components/feature/widget"),
      "@app": path.resolve(__dirname, "./src/app"),
    },
  },
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
    pool: "forks",
  },
});
```

| 항목 | 값 | 의미 |
| --- | --- | --- |
| `environment` | `node` | DOM이 필요하지 않은 순수 함수 단위 테스트가 중심 |
| `pool` | `forks` | 워커를 fork로 분리, 모듈 격리 보장 |
| `include` | `src/__tests__/**/*.test.ts` | 컴포넌트 옆이 아닌 **루트 테스트 디렉터리** 단일 위치만 인식 |

> alias는 `vite.config.ts`와 **중복 정의**되어 있습니다. alias를 수정할 때는 두 파일 모두 동기화해야 합니다.

## 테스트 파일 구성 (`src/__tests__/`)

| 파일 | 검증 대상 |
| --- | --- |
| `baseURL.test.ts` | `src/api/client.ts` — `VITE_API_URL` trailing slash 제거 |
| `errorCodeMap.test.ts` | 회원가입 `errorCodeMap`의 코드 → 필드/메시지 매핑 |
| `validateName.test.ts` | 한글만 / 최대 5자 검증 |
| `validateId.test.ts` | 영문·숫자 / 3~19자 검증 |
| `validatePassword.test.ts` | 빈문자열 → 허용문자 → 길이 → 조합 순차 검증 |
| `validatePasswordConfirm.test.ts` | 비밀번호 일치 여부 검증 |
| `validateGeneration.test.ts` | 정수 / 1~99 검증 |

총 7개 파일. 모두 검증 로직(`validate*.ts`)과 매핑 테이블 등 **순수 함수 단위**입니다.

## 실행 명령

```bash
bun run test           # watch 모드
bun run test:run       # 단일 실행
bun run test:coverage  # 커버리지 포함 실행
```

> `package.json`의 `test` 스크립트는 `bun test --watch`로 정의되어 있어 Vitest CLI가 아닌 **Bun 내장 테스트 러너**를 호출합니다. 두 러너의 호환성 차이를 인지하고 필요 시 `vitest` 명령으로 전환해야 할 수 있습니다.

## 신규 테스트 추가 가이드

1. 검증/매핑/유틸 등 **순수 함수**는 `src/__tests__/<함수명>.test.ts` 단일 파일로 추가.
2. 컴포넌트 단위 통합 테스트가 필요해지면 `environment: "jsdom"` 등으로 설정을 확장해야 합니다(현재 미적용).
3. 새 에러 코드 매핑은 `errorCodeMap.test.ts`에 케이스를 추가해 회귀를 방지하세요.
4. CI에서는 `bun run test:run`(단일 실행)을 사용합니다. watch 모드(`test`)는 로컬 개발용입니다.
