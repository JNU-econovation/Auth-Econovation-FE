# auth-econovation

에코노베이션 통합 인증(SSO) — **Bun workspaces 모노레포**.

하나의 레포에서 SSO 웹 앱, 어드민/개발자 콘솔, 공식 문서를 관리하며, 공유 디자인 시스템과 API 레이어를 패키지로 분리합니다.

**공식 문서**: https://docs.auth.econovation.kr (사용자 / 통합 개발자 / 운영자 가이드 — 도메인은 운영자 확정 후 갱신)

## 구조

```
auth-econovation/
├─ apps/
│  ├─ web/        # SSO 웹 앱 (로그인·회원가입)               @auth-econovation/web
│  ├─ console/    # 어드민/개발자 콘솔 (클라이언트·역할 관리)  @auth-econovation/console
│  └─ docs/       # 공식 문서 (VitePress)                     @auth-econovation/docs
├─ packages/
│  ├─ ui/         # 공유 디자인 시스템                         @auth-econovation/ui
│  └─ api/        # 공유 API 레이어 (+ /admin, /mocks)         @auth-econovation/api
├─ tsconfig.base.json   # 공통 컴파일러 옵션 (각 워크스페이스가 extends)
└─ eslint.config.js     # 루트 flat config (전 워크스페이스 적용)
```

- 내부 패키지는 빌드 단계 없이 소스(`.ts`)를 직접 export하며, 소비 앱의 Vite/Vitest 번들러가 트랜스파일합니다.
- 내부 참조는 `workspace:*` 프로토콜을 사용합니다.

## 시작하기

```bash
bun install            # 루트에서 1회 — 전체 워크스페이스 설치 (통합 lockfile)

bun run dev:web        # SSO 웹      (apps/web)
bun run dev:console    # 콘솔        (apps/console)
bun run dev:docs       # 문서        (apps/docs)

bun run build          # 전체 빌드   (web·console·docs)
bun run test           # 전체 테스트 (web·console·api)
bun run type-check     # 전체 타입체크
bun run lint           # 루트 flat config로 전체 린트
```

특정 워크스페이스만 실행: `bun run --filter @auth-econovation/web <script>`

## 기술 스택

React 19 · React Router v7 · Vite 6 · Tailwind CSS v4 · TanStack Query v5 · MSW · Vitest · Bun workspaces

개발 명령·설정은 `.claude/skills/development-knowledge`, 배포는 [운영자 가이드 — 배포](https://docs.auth.econovation.kr/operators/deployment)(`apps/docs/operators/deployment.md`)를 참조하세요.
