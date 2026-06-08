# 모노레포 전환 계획 — auth-econovation

> 작성일: 2026-06-09 · 대상: SSO 웹 + 공식 문서(docs) + **신규 개발자/어드민 콘솔**을 한 레포에서 관리
> 상태: **계획(승인 대기)** — 본 문서는 실행 전 설계 합의용입니다.

---

## 0. TL;DR

- **결론: 모노레포 전환은 적합합니다.** 이미 한 레포에 SSO 앱(루트)과 docs(VitePress 하위 패키지)가 공존하지만 "루트=앱 + 하위 docs"라는 **비대칭 구조**라, 세 번째 사이트를 추가하기 전에 정리하는 것이 옳습니다.
- 개발자 콘솔은 SSO 앱과 **같은 스택·디자인 시스템·API 레이어**를 공유합니다(어드민 `clients`/`members` API가 이미 MSW mock으로 설계됨). 공유 코드를 `packages/*`로 추출하면 중복·드리프트를 막을 수 있습니다.
- 확정된 방향:
  | 항목 | 선택 | 이유 |
  | --- | --- | --- |
  | 개발자 페이지 성격 | **클라이언트/어드민 콘솔** (인터랙티브 React 앱) | `adminClients`/`adminMembers` mock과 일치, SSO와 자산 공유 |
  | 재편 범위 | **전면 재편 `apps/*` 대칭** + `packages/*` 공유 | 3개 사이트 일관성·공유 극대화 |
  | 빌드 도구 | **Bun workspaces 단독** | 현 Bun 스택 유지, 추가 도구 0. Turborepo는 추후 비파괴적 추가 |
- 배포 모델은 **현행 유지**: 사이트별 독립 Vercel 프로젝트(Root Directory 분리). SPA rewrite는 절대 공유 금지.

---

## 1. 현황 분석

### 1.1 현재 구조

```
auth-econovation/                 ← 이 디렉토리 자체가 "SSO 프론트 웹"
├─ package.json                   # SSO 앱 (React 19 + Vite + RR7 + Tailwind v4, Bun)
├─ bun.lockb
├─ vite.config.ts                 # @, @shared, @entities, @pages, @widget, @app, @assets alias
├─ vitest.config.ts               # unit(node) + integration(jsdom + MSW) 2 프로젝트
├─ tsconfig.json / .app.json / .node.json
├─ vercel.json                    # SPA fallback: /(.*) → /  (SSO 라우팅 핵심)
├─ eslint.config.js / .prettierrc
├─ index.html / public/ (mockServiceWorker.js)
├─ src/
│  ├─ api/            client.ts(axios), auth/v1/{login,logout,signup,reissue}, auth/types.ts
│  ├─ app/            LoginPage, SignUpPage
│  ├─ components/     common/shared/{ui,layout}, feature/pages/{login,sign-up}
│  ├─ hooks/          features/query/mutations/{useSignIn,useSignUp}
│  ├─ lib/            queryClient.ts
│  └─ test/mocks/     auth·adminClients·adminMembers·members handlers + db + actor
└─ docs/                          ← VitePress 문서 사이트 (별도 패키지)
   ├─ package.json (auth-econovation-docs)  bun.lockb  .vitepress/config.ts
   └─ users/ developers/ operators/
```

### 1.2 핵심 사실 (전환 설계의 근거)

| 발견 | 의미 |
| --- | --- |
| `docs/`는 자체 `package.json`/`bun.lockb`/`.vitepress`를 가진 **독립 패키지**, 별도 Vercel 프로젝트로 배포 | 멀티 패키지 레포의 초기 형태가 이미 존재 |
| 루트 `vercel.json`의 `/(.*) → /` rewrite는 **SSO 전용** | docs/콘솔을 같은 Vercel 프로젝트에 두면 모든 경로가 로그인으로 흡수됨 → **반드시 프로젝트 분리** |
| `src/test/mocks/`에 `adminClients`(클라이언트 등록·redirectUris), `adminMembers`(역할 USER/ADMIN/SUPER_ADMIN) 핸들러 존재 (`admin-ui.md` 명세 기준) | 개발자 콘솔의 백엔드 계약이 이미 설계됨 → 콘솔은 이 mock/타입을 재사용 |
| `apiClient` = axios(`VITE_API_URL`, `withCredentials: true`) | 인증 쿠키 기반 공통 클라이언트 → 공유 패키지 1순위 |
| `errorCodeMap`은 화면별(`login`/`sign-up`), 공통 매핑 유틸 `getErrorMessageFromCode` 패턴 | 변환 유틸은 공유, 화면별 맵은 앱 잔류 가능 |
| `vitest`가 `unit`(node) / `integration`(jsdom+MSW) 프로젝트로 분리, alias 공유 | 앱별 vitest 설정 + 공유 setup 패턴 유지 |

### 1.3 현재 구조의 문제점

1. **비대칭** — 루트가 곧 SSO 앱이라, 새 앱은 또 다른 하위 폴더로 끼워 넣거나(중첩 심화) 루트를 점유해야 함.
2. **공유 코드 드리프트 위험** — 콘솔이 SSO의 디자인 시스템·API 클라이언트·에러맵·mock을 쓰려면 복붙하거나 상대경로 import로 끌어와야 하고, 시간이 지나면 갈라짐.
3. **루트 도구 설정 혼재** — `eslint.config.js`가 이미 `docs/.vitepress/cache`를 무시하는 등 루트가 두 패키지를 어정쩡하게 겸함.

---

## 2. 목표 아키텍처

### 2.1 디렉토리 구조

```
auth-econovation/
├─ package.json                # workspace 루트: { "workspaces": ["apps/*", "packages/*"] }
├─ bun.lockb                   # 통합 lockfile (단일)
├─ tsconfig.base.json          # 공통 컴파일러 옵션 (strict, bundler 모드 등)
├─ eslint.config.js            # 루트 flat config (전 워크스페이스 적용)
├─ .prettierrc
├─ apps/
│  ├─ web/                     # 기존 SSO 앱 (현 루트에서 이동) → @auth-econovation/web
│  │  ├─ package.json  index.html  vite.config.ts  vitest.config.ts
│  │  ├─ tsconfig.json / .app.json / .node.json
│  │  ├─ vercel.json           # SPA fallback (SSO 전용, 격리)
│  │  ├─ public/ (mockServiceWorker.js)
│  │  └─ src/                  # 로그인·회원가입 등 SSO 전용 화면 잔류
│  ├─ developers/              # 신규 클라이언트/어드민 콘솔 → @auth-econovation/developers
│  │  ├─ package.json  index.html  vite.config.ts  vercel.json (SPA, 격리)
│  │  ├─ public/
│  │  └─ src/                  # 클라이언트 목록/등록, 역할 관리 화면
│  └─ docs/                    # 기존 docs/ 이동 → @auth-econovation/docs (VitePress)
│     ├─ package.json  .vitepress/config.ts
│     └─ users/ developers/ operators/
├─ packages/
│  ├─ ui/                      # @auth-econovation/ui — 공유 디자인 시스템
│  │  └─ src/                  # DefaultButton, Input, Select, Text, layout/*
│  └─ api/                     # @auth-econovation/api — 공유 API 레이어
│     └─ src/
│        ├─ client.ts          # axios 인스턴스 (VITE_API_URL, withCredentials)
│        ├─ auth/              # login/logout/signup/reissue + types
│        ├─ admin/             # clients/members (콘솔 핵심, 현재 mock만 존재 → 실구현)
│        ├─ error/             # getErrorMessageFromCode 등 공통 변환 유틸
│        └─ mocks/             # MSW handlers + db + actor (web/developers 공유)
└─ .claude/                    # 스킬·룰 (유지)
```

> `packages/config`(공유 tsconfig/eslint/prettier 프리셋)는 **초기에 도입하지 않습니다.** 루트 `tsconfig.base.json` + 루트 `eslint.config.js` 공유로 충분하며, 패키지가 더 늘면 그때 추출합니다(YAGNI).

### 2.2 패키지 명명 / 의존성 그래프

- 스코프: `@auth-econovation/*`
- 내부 참조는 `"workspace:*"` 프로토콜 사용.

```
        ┌────────────────────────────┐
        │     @auth-econovation/ui    │◄──────────┐
        └────────────────────────────┘           │
        ┌────────────────────────────┐           │
        │     @auth-econovation/api   │◄────┐     │
        │     (+ /mocks, /admin)      │     │     │
        └────────────────────────────┘     │     │
                  ▲           ▲             │     │
       ┌──────────┘           └──────────┐  │     │
   apps/web                         apps/developers
   (ui + api)                       (ui + api + admin)

   apps/docs (VitePress) — 독립, 런타임 공유 없음
```

### 2.3 공유/잔류 경계

| 자산 | 현재 위치 | 이동 위치 | 비고 |
| --- | --- | --- | --- |
| 디자인 시스템 (Button/Input/Select/Text, layout/*) | `src/components/common/shared` | `packages/ui` | web·developers 공유 |
| axios 클라이언트 | `src/api/client.ts` | `packages/api/client.ts` | `VITE_API_URL`·`withCredentials` |
| 인증 API (login/logout/signup/reissue, types) | `src/api/auth` | `packages/api/auth` | 주로 web, 콘솔은 세션 재사용 |
| 어드민 API (clients/members) | (mock만 존재) | `packages/api/admin` | **콘솔 핵심** — Phase 3에서 실구현 |
| 에러코드 변환 유틸 | `.../errorCodeMap.ts` | `packages/api/error` | 공통 유틸만; **화면별 맵은 앱 잔류** |
| MSW mocks (handlers/db/actor) | `src/test/mocks` | `packages/api/mocks` | web·developers 공유 |
| queryClient | `src/lib/queryClient.ts` | `packages/api` 또는 앱 잔류 | 기본 옵션만이면 공유, 화면 특화면 앱 |
| 회원가입 검증 (`validate*`) | `sign-up/*` | **apps/web 잔류** | SSO 가입 폼 전용 |
| 로그인·회원가입 페이지/섹션 | `src/app`, `feature/pages` | **apps/web 잔류** | SSO 전용 화면 |

---

## 3. 워크스페이스 구성 (Bun)

### 3.1 루트 `package.json`

```jsonc
{
  "name": "auth-econovation",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:web":   "bun run --filter @auth-econovation/web dev",
    "dev:console": "bun run --filter @auth-econovation/developers dev",
    "dev:docs":  "bun run --filter @auth-econovation/docs dev",
    "build":     "bun run --filter '*' build",   // 전체 빌드
    "test":      "bun run --filter '*' test",
    "lint":      "eslint ."                        // 루트 flat config 1회
  },
  "devDependencies": {
    // 전 워크스페이스 공유 도구만 루트에 (eslint, prettier, typescript, typescript-eslint ...)
  }
}
```

> Bun workspace 필터: `bun run --filter <패키지명|글롭> <script>`. 전체는 `--filter '*'`. 설치는 루트 `bun install` 한 번으로 모든 워크스페이스 처리(통합 `bun.lockb`).

### 3.2 앱 `package.json` 예 (`apps/web`)

```jsonc
{
  "name": "@auth-econovation/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite", "build": "vite build", "preview": "vite preview",
    "test": "vitest run", "type-check": "tsc -b"
  },
  "dependencies": {
    "@auth-econovation/ui": "workspace:*",
    "@auth-econovation/api": "workspace:*",
    "react": "^19", "react-dom": "^19",
    "react-router": "^7", "@tanstack/react-query": "^5", "axios": "^1"
  },
  "devDependencies": {
    "vite": "^6", "@vitejs/plugin-react-swc": "^3",
    "@tailwindcss/vite": "^4", "tailwindcss": "^4",
    "vitest": "^4", "jsdom": "^29", "msw": "^2",
    "@testing-library/react": "^16", "@testing-library/jest-dom": "^6"
  }
}
```

### 3.3 패키지 `package.json` 예 (`packages/api`)

```jsonc
{
  "name": "@auth-econovation/api",
  "private": true,
  "type": "module",
  "exports": {
    ".":        "./src/index.ts",
    "./admin":  "./src/admin/index.ts",
    "./mocks":  "./src/mocks/index.ts",   // MSW 핸들러는 별도 진입점(번들 분리)
    "./error":  "./src/error/index.ts"
  },
  "peerDependencies": { "axios": "^1" }
}
```

> 소비 앱이 Vite/Vitest로 번들하므로 **빌드 단계 없이 소스(`.ts`)를 직접 export**합니다(internal package). 별도 `tsup`/`tsc` 빌드는 불필요 — 앱의 번들러가 트랜스파일.

---

## 4. 마이그레이션 단계

> 원칙: **각 Phase 끝에 검증 게이트(G)를 통과**해야 다음으로 진행. Phase 1·2는 **기능/동작 무변경(리프트 앤 시프트 + 추출)** 이 목표 — 회귀가 없어야 함.

### Phase 0 — 준비 (~0.5d)

- [ ] 진행 중인 feat 브랜치·열린 PR 머지 또는 동결 공지 (대량 `git mv`는 충돌 유발 → 충돌면 최소화)
- [ ] `main`에서 작업 브랜치 생성: `chore/monorepo-migration`
- [ ] **현 Vercel 설정 백업**(메모): web/docs 각 프로젝트의 Root Directory·Install/Build Command·환경변수(`VITE_API_URL`)
- [ ] baseline 기록: `bun run build`, `bun test`, `bun run docs:build` 모두 green 확인

### Phase 1 — 워크스페이스 골격 + 기존 2앱 이동 (~1~1.5d)

- [ ] `apps/`, `packages/` 디렉토리 생성
- [ ] **SSO 앱 이동(히스토리 보존 `git mv`)**: `src public index.html vite.config.ts vitest.config.ts tsconfig*.json vercel.json` → `apps/web/`
- [ ] `apps/web/package.json` 신설(web 전용 deps 이관), 루트 `package.json`은 workspace 루트로 축소
- [ ] **docs 이동**: `git mv docs apps/docs`, `name`을 `@auth-econovation/docs`로, 개별 `docs/bun.lockb` 제거(통합 lockfile로 흡수)
- [ ] 루트 `workspaces` + 스크립트 설정, `eslint.config.js`·`.prettierrc`·`tsconfig.base.json`을 루트 공유로 정리
- [ ] 루트 `bun install` (통합 `bun.lockb` 생성)
- [ ] alias 점검: web의 vite/vitest/tsconfig alias는 `__dirname` 상대 기준이라 이동 후에도 동작. docs `editLink`(develop 브랜치 기준) 경로가 `apps/docs`를 가리키도록 갱신

**검증 게이트 G1**
- [ ] `bun install` 성공
- [ ] `bun run --filter @auth-econovation/web build` / `test` green
- [ ] `bun run --filter @auth-econovation/docs build` green
- [ ] web·docs dev 서버 수동 기동 확인
- [ ] Vercel: web/docs 프로젝트 Root Directory를 `apps/web`/`apps/docs`로 변경 → **preview 배포 정상**
- **롤백**: 브랜치 폐기(= `main` 무영향). 미머지 상태 유지로 안전.

### Phase 2 — 공유 패키지 추출 (~1.5~2d)

- [ ] `packages/ui`: `shared/ui` + `layout/*` 이동, `package.json`·`exports` 작성. web import를 `@auth-econovation/ui`로 교체(`@shared` alias 정리)
- [ ] `packages/api`: `client.ts`, `auth/*`, `error/*`, `mocks/*` 이동. mocks 내부의 `@/api/...` 참조를 패키지 상대경로로 정리. web `test/setup.ts`는 `@auth-econovation/api/mocks`에서 핸들러 import
- [ ] **Tailwind v4 공유**: `packages/ui`가 유틸 클래스를 쓰므로 각 앱 CSS에 `@source "../../packages/ui/src"` 지시어 추가(또는 공유 preset) → 클래스 누락 방지
- [ ] web 의존성에 `@auth-econovation/ui`·`/api` 추가, `bun install`

**검증 게이트 G2**
- [ ] web `build`/`test`/`lint` green
- [ ] 시각·동작 회귀 없음(로그인/회원가입 수동 확인)
- **롤백**: 패키지 추출 커밋 단위 revert

### Phase 3 — 개발자/어드민 콘솔 신규 앱 (~3~5d, 기능 규모에 따라)

- [ ] `apps/developers` 스캐폴드: Vite + React 19 + RR7 + Tailwind v4, `@auth-econovation/ui`·`/api` 의존
- [ ] 라우팅·화면: 어드민 로그인 가드 → 클라이언트 목록/등록/수정(redirectUris) → 회원 역할 관리(SUPER_ADMIN 전용)
- [ ] `packages/api/admin`(clients/members) **실 API 구현** — 현재 mock만 존재. `.claude/rules/api-guide.md` 규칙(경로 상수 대문자, `XxxApiResponse`, `xxxApi`, JSDoc) 준수
- [ ] MSW: 개발 모드에서 `@auth-econovation/api/mocks` 재사용, `X-Mock-Role` 헤더로 역할 시뮬레이션
- [ ] vitest unit/integration 구성, MSW 핸들러 재사용

**검증 게이트 G3**
- [ ] developers `build`/`test` green
- [ ] 클라이언트 등록·역할 변경 핵심 흐름 동작(통합 테스트 또는 E2E)
- [ ] Vercel: developers 신규 프로젝트(Root Directory=`apps/developers`), 자체 `vercel.json` SPA rewrite, 도메인 연결 → preview 정상

### Phase 4 — 마무리 (~0.5~1d)

- [ ] 스킬/문서 갱신: `docs-knowledge`(docs 경로 `docs/`→`apps/docs`), `development-knowledge`(명령어), `CLAUDE.md`, `README.md`, `docs/operators/deployment.md`(3개 프로젝트 반영)
- [ ] 미사용 코드/의존성 정리(`knip`/`depcheck`) — `refactor-cleaner` 활용
- [ ] (선택) CI 도입: 워크스페이스 일괄 `lint`/`test`/`build`, 변경 앱만 빌드

---

## 5. 배포 전략 (Vercel)

| 프로젝트 | Root Directory | Framework | Install | Build | Output | rewrite |
| --- | --- | --- | --- | --- | --- | --- |
| auth-web | `apps/web` | Vite | `bun install` | `bun run build` | `apps/web/dist` | **SPA `/(.*)→/`** |
| auth-developers | `apps/developers` | Vite | `bun install` | `bun run build` | `apps/developers/dist` | **SPA `/(.*)→/`** |
| auth-docs | `apps/docs` | Other(VitePress) | `bun install` | `vitepress build` | `.vitepress/dist` | 없음 |

**반드시 지킬 원칙**
1. **SPA fallback rewrite는 절대 공유·통합 금지.** React 앱(web·developers)은 각자 디렉토리의 `vercel.json`에만 rewrite를 둔다. 한 프로젝트에 섞으면 docs/콘솔 경로가 로그인으로 흡수됨(docs-knowledge 경고).
2. **각 사이트는 독립 Vercel 프로젝트.** 모노레포여도 프로젝트 분리 유지 — 현행과 동일.
3. **Bun workspace 빌드**: Root Directory를 `apps/web`으로 두되, Vercel "**Include source files outside of the Root Directory**"(모노레포) 옵션을 켜서 `packages/*`에 접근 가능하게 함. Install은 루트 `bun install`로 통합 lockfile 사용.
4. **환경변수**: `VITE_API_URL`은 web·developers 각 프로젝트에 개별 설정(같은 백엔드, 콘솔은 어드민 엔드포인트 사용).

---

## 6. 빌드 / 테스트 / 품질 설정

- **TypeScript**: 루트 `tsconfig.base.json`(strict, `moduleResolution: bundler`, `noUnusedLocals` 등 현 옵션 승계) → 각 앱/패키지가 `extends`. 앱별 `paths`는 앱 tsconfig에 유지. 내부 패키지는 `exports`로 타입 노출.
- **Vitest**: 앱별 `vitest.config.ts` 유지(unit=node / integration=jsdom+MSW 2 프로젝트 패턴). alias는 앱 내부 경로 기준. 공유 setup은 `@auth-econovation/api/mocks` 진입점 사용.
- **ESLint/Prettier**: 루트 단일 flat config로 전체 적용. `ignores`에 각 앱의 `dist`, `public/mockServiceWorker.js`, `apps/docs/.vitepress/cache` 반영.
- **MSW worker**: 각 앱 `public/`에 `mockServiceWorker.js` 배치, `package.json`의 `msw.workerDirectory`를 앱별로 설정.

---

## 7. 리스크 & 대응

| # | 리스크 | 영향 | 대응 |
| --- | --- | --- | --- |
| R1 | Vercel이 Bun workspace를 자동 감지하지 못함 | 배포 빌드 실패 | Root Directory + Install/Build Command 명시, "include outside files" 옵션 활성화, **preview로 선검증** |
| R2 | SPA rewrite 누수 | docs/콘솔이 로그인으로 흡수 | 앱별 `vercel.json` 격리 + 프로젝트 분리(절대 공유 금지) |
| R3 | 대량 `git mv` ↔ 진행 중 브랜치 충돌 | 머지 충돌 다발 | Phase 0에서 열린 PR 머지/동결, Phase 1을 짧게 끝내고 팀 공지 |
| R4 | 통합 lockfile 변동 | 의존성 회귀 | Phase 1에서 한 번에 `bun install`, lock 변경 리뷰 |
| R5 | Tailwind v4 공유 컴포넌트 클래스 누락 | 스타일 깨짐 | `@source`로 `packages/ui` 포함, 빌드 후 시각 확인 |
| R6 | MSW worker 경로(public) 누락 | 모킹 미동작 | 앱별 `public/mockServiceWorker.js` + `msw.workerDirectory` 설정 |
| R7 | tsconfig path/references 불일치 | 타입체크 실패 | base 분리 + 앱별 paths, 패키지는 `exports`/types |
| R8 | docs `editLink`가 옛 경로 가리킴 | 편집 링크 깨짐 | `config.ts` `editLink`를 `apps/docs` 기준으로 갱신 |

---

## 8. 확인 필요 (TBD)

- **콘솔 도메인**: `dev.auth.econovation.kr` 등 무엇으로 할지 (운영자 확정 필요)
- **콘솔 인증 방식**: SSO 자체 로그인 세션 재사용 vs 어드민 전용 게이트
- **역할 관리(SUPER_ADMIN) 포함 여부**: 콘솔에 통합 vs 운영자 어드민으로 분리
- **CI 도입**: 현재 `.github/workflows` 없음 → GitHub Actions 등 도입 시점
- **일정 산정치는 1인 기준 러프값**이며 콘솔 기능 범위에 따라 Phase 3가 가장 크게 변동

---

## 9. 권장 진행 순서

1. 본 계획 합의 → Phase 0~1을 **하나의 PR**로(리프트 앤 시프트, 리뷰 쉬움)
2. Phase 2를 **별도 PR**로(공유 추출, 회귀 집중 검증)
3. Phase 3는 콘솔 기능 단위로 **여러 PR**(점진 배포)
4. Phase 4는 문서/정리 **마무리 PR**

> Phase 1까지는 언제든 브랜치 폐기로 롤백 가능하므로, **먼저 Phase 1만 PoC로 진행해 Vercel Bun workspace 배포(R1)를 검증**한 뒤 나머지를 확정하는 것을 권장합니다.
