# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

auth-econovation은 에코노베이션 서비스들에게 통합 로그인(SSO)을 제공하는 프론트엔드 애플리케이션입니다. OAuth2.0 Provider와 유사한 방식으로 동작하며, 사용자가 한 번 로그인하면 연결된 모든 서비스에서 동일한 계정으로 인증됩니다.

**외부 노출 SSO 흐름은 임시 토큰 교환(Authorization Code Exchange) 방식**입니다. 콜백 URL에는 일회용 임시 토큰(`code`)만 부착되고, 실제 AT/RT는 클라이언트 서비스 서버가 SSO 백엔드와 직접 통신하여 교환합니다. 이 흐름이 외부 개발자 가이드의 단일 진실(source of truth)이며, 옛 "URL에 AT/RT 직접 전달 + `client-type=WEB|APP`" 방식은 **deprecated** 입니다.

**비즈니스 로직과 도메인 요구사항은 `domain-knowledge` skills를 참조하세요.**

## Development Commands

```bash
# Bun을 사용하여 의존성 설치
bun install

# 개발 서버 시작 (HMR 포함)
bun run dev

# 프로덕션 빌드
bun run build

# 프로덕션 빌드 미리보기
bun run preview

# ESLint 실행
bun run lint

# 테스트 실행
bun test

# 문서 사이트 (VitePress, docs/ 별도 패키지)
bun run docs:install   # 최초 1회 (docs/ 의존성 설치)
bun run docs:dev       # 문서 사이트 개발 서버
bun run docs:build     # docs/.vitepress/dist 정적 산출물 생성
bun run docs:preview   # 빌드된 정적 사이트 미리보기
```

## Tech Stack

- **Bun** - 패키지 매니저 및 런타임
- **React 19** with TypeScript - UI 라이브러리
- **React Router v7** - 클라이언트 측 라우팅
- **Vite** - 빌드 도구 및 개발 서버
- **SWC** - Fast Refresh (via @vitejs/plugin-react-swc)
- **Tailwind CSS v4** - 유틸리티 기반 CSS 프레임워크 (via @tailwindcss/vite)
- **ESLint** - 코드 품질 도구

## TypeScript Configuration

프로젝트는 project references를 사용한 2개의 설정 파일 구조:

- `tsconfig.app.json` - `src/` 내 애플리케이션 코드, strict mode 활성화
- `tsconfig.node.json` - Vite 설정 파일용

Strict 모드 추가 옵션:

- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`

## Code Quality

- React Hooks 규칙 및 컴포넌트 export 패턴 강제
- TypeScript strict mode 활성화
- ESLint 플러그인: react-hooks, react-refresh, typescript-eslint

## Project Structure

```
src/
  main.tsx          - 애플리케이션 진입점
  App.tsx           - 메인 컴포넌트
  index.css         - 글로벌 스타일
  App.css           - 컴포넌트별 스타일
  assets/           - 정적 에셋
  vite-env.d.ts     - Vite 타입 선언
```

## Build Output

- Development: Vite dev server의 HMR
- Production: `dist/` 디렉토리로 출력 (git에서 제외됨)

## SSO 인증 흐름 (외부 통합 기준)

외부 개발자 가이드(`docs/developers/`)의 기준 흐름은 다음과 같습니다. 본 흐름은 **단일 진실**이며, 문서·코드 양쪽에서 충돌하는 표기가 발견되면 이 흐름을 따라 정렬합니다.

1. 클라이언트 서비스가 사용자를 `https://auth.econovation.kr/?redirect-url=<callback>`로 보냄.
2. 사용자가 SSO 페이지에서 로그인하면 SSO 백엔드가 일회용 임시 토큰(`code`)을 발급해 콜백으로 리다이렉트.
3. 클라이언트 서비스의 **서버**가 `POST /api/v1/auth/token/exchange`에 `code` + `client_id` + `client_secret`을 보내 AT/RT로 교환. 요청의 `Origin` 헤더가 사전 등록된 오리진과 일치해야 함.
4. AT 만료 시 `POST /api/v1/auth/token/refresh`로 갱신.

핵심 규칙:

- `client_secret`은 **절대 클라이언트 코드/번들에 노출 금지** — 항상 서버 사이드에서만 사용.
- 임시 토큰은 **일회용** — Strict Mode 중복 호출로 같은 코드가 두 번 교환되지 않도록 `ref` 등으로 차단.
- 콜백 파라미터 이름은 `code`. 옛 `accessToken`/`refreshToken` URL 전달 방식은 사용하지 않음.
- `client-type=WEB|APP` 쿼리 파라미터는 외부 가이드에서 제거됨. 새 흐름에는 클라이언트 타입 구분이 없음.

다음 항목은 백엔드 확정 전까지 **TBD**이며, 가이드 문서에 `*(TBD: ...)*` 표기로 유지합니다:

- 토큰 교환·갱신 엔드포인트 경로/필드명의 최종 확정값
- 임시 토큰·AT·RT 수명 및 RT 회전 정책
- 오리진 검증 기준 헤더(`Origin` vs `Referer`)
- 오리진 등록 신청 방식 및 `client_id`/`client_secret` 발급 정책
- 토큰 교환 관련 에러 코드(현재 4010~4013 제안값)

> **현재 코드 구현은 일시적으로 옛 흐름**(`POST /api/v1/auth/login`을 SSO 페이지가 직접 호출)일 수 있습니다. `src/api/auth/v1/login/index.ts`는 SSO 페이지 내부 인증용이며, 외부 노출 교환 엔드포인트(`/token/exchange`, `/token/refresh`)는 SSO **백엔드가 직접 제공**합니다(본 프론트 코드에서 호출하지 않음). 둘을 혼동하지 마세요.

## Documentation Site (`docs/`)

`docs/` 디렉터리는 **VitePress 기반 공식 문서 사이트**이며, 메인 SSO 앱과는 분리된 별도 패키지입니다. 자체 `package.json` / `bun.lockb` / `.vitepress/` 구성을 가지며, **독립된 Vercel 프로젝트**로 배포됩니다.

### 문서 구조 (세 갈래 독자)

| 섹션 | 대상 독자 | 주요 내용 |
| --- | --- | --- |
| `docs/users/` | 동아리 회원(일반 사용자) | 회원가입, 로그인, 기존 계정 연결, FAQ |
| `docs/developers/` | 외부 통합 개발자 | SSO 연동 흐름, API 명세, 콜백/토큰 처리, 에러 코드 |
| `docs/operators/` | 본 레포 유지보수/배포 담당자 | 아키텍처, 환경 변수, 라우팅, 테스트, 배포, 운영 런북 |

- 사이트 진입점: `docs/index.md` (VitePress home layout)
- 사이드바/네비게이션 정의: `docs/.vitepress/config.ts`
- 언어: `ko-KR`, `cleanUrls: true`, `editLink`는 **develop 브랜치** 기준

### 작성·수정 시 주의사항

1. **신규 페이지 추가 시 반드시 `docs/.vitepress/config.ts`의 sidebar에 등록**해야 사이드바에 노출됩니다. 등록하지 않으면 빌드는 되지만 탐색이 불가능합니다.
2. **내부 링크는 확장자 없이 작성**합니다 (`cleanUrls: true`). 예: `/developers/quick-start` (`.md` 붙이지 않음).
3. **상대 경로 링크**를 사용하면 섹션 간 이동이 안전합니다. 예: `../developers/sso-integration`.
4. 페이지 frontmatter에는 가능한 한 `title`, `description`을 명시합니다.
5. **소스 코드 경로를 인용할 때**는 `docs/developers/index.md` / `docs/operators/index.md` 의 "관련 소스 코드 위치" 표 형식을 따라 실제 파일 경로(`src/...`)와 함께 표기합니다. 리팩토링 시 이 경로들도 함께 갱신해야 합니다.
6. **인증 흐름 관련 표기는 "SSO 인증 흐름 (외부 통합 기준)" 절을 단일 진실로 따릅니다.** 옛 `client-type=WEB|APP`, URL에 AT/RT 직접 전달 같은 표현이 문서에 남아 있으면 임시 토큰 교환 방식으로 정렬하세요. 미확정 항목은 임의로 채우지 말고 `*(TBD: ...)*` 표기로 명시합니다.

### 의존성·배포 관련 주의사항

1. **docs 의존성 변경은 반드시 `cd docs && bun add ...`** 형태로 수행하세요. 루트 `package.json`에 VitePress가 들어가면 안 됩니다.
2. **메인 앱의 `package.json` / `vite.config.ts` / `vercel.json`은 docs 작업 시 절대 변경 금지**입니다. 특히 루트 `vercel.json`의 SPA fallback rewrite(`/(.*) → /`)는 SSO 라우팅의 핵심이므로 docs를 같은 Vercel 프로젝트에 두면 모든 문서 경로가 로그인 페이지로 흡수됩니다 — **반드시 별도 Vercel 프로젝트(Root Directory = `docs`)로 분리**합니다.
3. `docs/.vitepress/cache/`, `docs/.vitepress/dist/`, `docs/node_modules/`는 `docs/.gitignore`로 제외됩니다. 빌드 산출물을 커밋하지 마세요.
4. SSO 도메인이 변경되면 `docs/developers/quick-start.md`, `docs/developers/sso-integration.md` 등의 예시 URL도 함께 갱신해야 합니다.
5. 빌드 검증 시 메인 앱(`bun run build`)과 문서 사이트(`bun run docs:build`)가 **둘 다 0 종료 코드**로 끝나는지 확인하세요.
