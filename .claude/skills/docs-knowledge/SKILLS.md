---
name: docs-knowledge
description: 해당 프로젝트의 공식 문서(apps/docs/...)에 대한 정보 정리입니다. 공식 문서를 수정할 때 읽으세요
---

## Documentation Site (`apps/docs/`)

`apps/docs/` 디렉터리는 **VitePress 기반 공식 문서 사이트**이며, 모노레포(Bun workspaces)의 한 워크스페이스(`@auth-econovation/docs`)입니다. 자체 `package.json` / `.vitepress/` 구성을 가지며, **독립된 Vercel 프로젝트**(Root Directory = `apps/docs`)로 배포됩니다. (lockfile은 루트 통합 `bun.lockb` 하나로 관리하며, `apps/docs`는 개별 lockfile을 두지 않습니다.)

### 문서 구조 (세 갈래 독자)

| 섹션                    | 대상 독자                    | 주요 내용                                            |
| ----------------------- | ---------------------------- | ---------------------------------------------------- |
| `apps/docs/users/`      | 동아리 회원(일반 사용자)     | 회원가입, 로그인, 기존 계정 연결, FAQ                |
| `apps/docs/developers/` | 외부 통합 개발자             | SSO 연동 흐름, API 명세, 콜백/토큰 처리, 에러 코드   |
| `apps/docs/operators/`  | 본 레포 유지보수/배포 담당자 | 아키텍처, 환경 변수, 라우팅, 테스트, 배포, 운영 런북 |

- 사이트 진입점: `apps/docs/index.md` (VitePress home layout)
- 사이드바/네비게이션 정의: `apps/docs/.vitepress/config.ts`
- 언어: `ko-KR`, `cleanUrls: true`, `editLink`는 **develop 브랜치 + `apps/docs/` 경로** 기준

### 작성·수정 시 주의사항

1. **신규 페이지 추가 시 반드시 `apps/docs/.vitepress/config.ts`의 sidebar에 등록**해야 사이드바에 노출됩니다. 등록하지 않으면 빌드는 되지만 탐색이 불가능합니다.
2. **내부 링크는 확장자 없이 작성**합니다 (`cleanUrls: true`). 예: `/developers/quick-start` (`.md` 붙이지 않음).
3. **상대 경로 링크**를 사용하면 섹션 간 이동이 안전합니다. 예: `../developers/sso-integration`.
4. 페이지 frontmatter에는 가능한 한 `title`, `description`을 명시합니다.
5. **소스 코드 경로를 인용할 때**는 `apps/docs/developers/index.md` / `apps/docs/operators/index.md` 의 "관련 소스 코드 위치" 표 형식을 따라 실제 파일 경로(SSO 앱은 `apps/web/src/...`, 공유 코드는 `packages/...`)와 함께 표기합니다. 리팩토링 시 이 경로들도 함께 갱신해야 합니다.
6. **인증 흐름 관련 표기는 "SSO 인증 흐름 (외부 통합 기준)" 절을 단일 진실로 따릅니다.** 옛 `client-type=WEB|APP`, URL에 AT/RT 직접 전달 같은 표현이 문서에 남아 있으면 임시 토큰 교환 방식으로 정렬하세요. 미확정 항목은 임의로 채우지 말고 `*(TBD: ...)*` 표기로 명시합니다.

### 의존성·배포 관련 주의사항

1. **docs 의존성 변경은 루트에서 `bun add --filter @auth-econovation/docs <pkg>`** (또는 `apps/docs`에서 작업) 형태로 수행하세요. lockfile은 루트 통합 `bun.lockb` 하나로 관리됩니다. 다른 앱(`apps/web`/`apps/console`)의 런타임 의존성에 VitePress가 섞이면 안 됩니다.
2. **각 React 앱(`apps/web`·`apps/console`)의 `vercel.json` SPA fallback rewrite(`/(.*) → /`)는 절대 docs와 공유 금지**입니다. 같은 Vercel 프로젝트에 두면 모든 문서 경로가 로그인/콘솔 진입점으로 흡수됩니다 — **반드시 별도 Vercel 프로젝트(Root Directory = `apps/docs`, rewrite 없음)로 분리**합니다.
3. `apps/docs/.vitepress/cache/`, `apps/docs/.vitepress/dist/`, `apps/docs/node_modules/`는 gitignore로 제외됩니다. 빌드 산출물을 커밋하지 마세요.
4. SSO 도메인이 변경되면 `apps/docs/developers/quick-start.md`, `apps/docs/developers/sso-integration.md` 등의 예시 URL도 함께 갱신해야 합니다.
5. 빌드 검증 시 문서 사이트(`bun run build:docs` 또는 `bun run --filter @auth-econovation/docs build`)와 React 앱들(`bun run build`)이 **모두 0 종료 코드**로 끝나는지 확인하세요.
