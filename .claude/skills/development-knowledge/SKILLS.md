---
name: development-knowledge
description: 해당 프로젝트의 개발시에 필요한 정보들에 대한 정리입니다. 빌드 명령, 기술 스택, 코드 포매팅, 빌드 설정에 대한 정보가 필요하면 이 스킬을 읽으세요
---

## 모노레포 개요

본 레포는 **Bun workspaces 모노레포**입니다. `apps/*`(web·console·docs)와 `packages/*`(ui·api)로 구성되며, 루트 `bun install` 한 번으로 모든 워크스페이스를 설치합니다(통합 `bun.lockb`).

| 워크스페이스 | 패키지명 | 역할 |
| --- | --- | --- |
| `apps/web` | `@auth-econovation/web` | SSO 웹 앱(로그인·회원가입) |
| `apps/console` | `@auth-econovation/console` | 어드민/개발자 콘솔(클라이언트 등록·역할 관리) |
| `apps/docs` | `@auth-econovation/docs` | 공식 문서(VitePress) |
| `packages/ui` | `@auth-econovation/ui` | 공유 디자인 시스템(버튼/인풋/레이아웃 + `styles.css`) |
| `packages/api` | `@auth-econovation/api` | 공유 API 레이어(client/auth + `/admin` + `/mocks`) |

내부 패키지는 빌드 없이 소스(`.ts`)를 직접 export하며, 소비 앱의 Vite/Vitest 번들러가 트랜스파일합니다. 내부 참조는 `workspace:*` 프로토콜을 사용합니다.

## Development Commands

```bash
# 루트에서 1회 — 전체 워크스페이스 설치 (통합 lockfile)
bun install

# 개발 서버 (앱별)
bun run dev:web        # apps/web
bun run dev:console    # apps/console
bun run dev:docs       # apps/docs

# 전체 워크스페이스 일괄 (bun --filter '*')
bun run build          # 전체 빌드   (web·console·docs)
bun run test           # 전체 테스트 (web·console·api)
bun run type-check     # 전체 타입체크 (web·console·api·ui)
bun run lint           # 루트 flat config로 전체 린트 (1회)

# 특정 워크스페이스만
bun run --filter @auth-econovation/web build
bun run --filter @auth-econovation/console test
bun run --filter @auth-econovation/docs build
```

> Bun 필터: `bun run --filter <패키지명|글롭> <script>`. 전체는 `--filter '*'`. 해당 스크립트가 없는 워크스페이스는 자동 skip됩니다.

## Tech Stack

- **Bun workspaces** - 모노레포 + 패키지 매니저 및 런타임
- **React 19** with TypeScript - UI 라이브러리 (web·console)
- **React Router v7** - 클라이언트 측 라우팅
- **Vite 6** - 빌드 도구 및 개발 서버
- **SWC** - Fast Refresh (via @vitejs/plugin-react-swc)
- **Tailwind CSS v4** - 유틸리티 기반 CSS (via @tailwindcss/vite). 공유 디자인 토큰은 `packages/ui/src/styles.css`, 모노레포(node_modules 밖) 클래스 스캔은 `@source` 지시어로 등록.
- **TanStack Query v5** - 서버 상태 / API 통신 훅
- **MSW** - API 모킹(`@auth-econovation/api/mocks`, web·console 공유. 노드 server / 브라우저 worker 진입점 분리)
- **Vitest** - 테스트 (unit=node / integration=jsdom+MSW 2 프로젝트)
- **VitePress** - 문서 사이트 (apps/docs)
- **ESLint / Prettier** - 코드 품질

## TypeScript Configuration

- 루트 `tsconfig.base.json` — 공통 컴파일러 옵션(strict, `moduleResolution: bundler`, `noUnusedLocals` 등). 각 앱/패키지가 `extends`.
- 앱별 `tsconfig.app.json`(애플리케이션 코드 + `paths` alias) / `tsconfig.node.json`(Vite 설정용). project references 구조.
- 내부 패키지는 `package.json`의 `exports`로 소스/타입을 노출합니다.

Strict 모드 추가 옵션:

- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`

## Code Quality

- React Hooks 규칙 및 컴포넌트 export 패턴 강제
- TypeScript strict mode 활성화
- ESLint 플러그인: react-hooks, react-refresh, typescript-eslint (루트 단일 flat config가 전 워크스페이스에 적용)

## Project Structure

```
apps/<app>/src/
  main.tsx          - 애플리케이션 진입점
  App.tsx           - 라우팅 루트
  index.css         - 글로벌 스타일 (tailwind + @auth-econovation/ui/styles.css import)
  vite-env.d.ts     - Vite 타입 선언
packages/<pkg>/src/
  index.ts          - 패키지 배럴 (exports 진입점)
```

## Build Output

- Development: Vite dev server의 HMR
- Production: 각 앱 `dist/` 디렉토리 (git에서 제외). docs는 `apps/docs/.vitepress/dist`.
