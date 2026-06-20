# 의존성·배포 관련 주의사항

> `docs-knowledge` 스킬의 일부입니다. 진입점은 [SKILLS.md](./SKILLS.md)를 참조하세요.

1. **docs 의존성 변경은 루트에서 `bun add --filter @auth-econovation/docs <pkg>`** (또는 `apps/docs`에서 작업) 형태로 수행하세요. lockfile은 루트 통합 `bun.lockb` 하나로 관리됩니다. 다른 앱(`apps/web`/`apps/console`)의 런타임 의존성에 VitePress가 섞이면 안 됩니다.
2. **각 React 앱(`apps/web`·`apps/console`)의 `vercel.json` SPA fallback rewrite(`/(.*) → /`)는 절대 docs와 공유 금지**입니다. 같은 Vercel 프로젝트에 두면 모든 문서 경로가 로그인/콘솔 진입점으로 흡수됩니다 — **반드시 별도 Vercel 프로젝트(Root Directory = `apps/docs`, rewrite 없음)로 분리**합니다.
3. `apps/docs/.vitepress/cache/`, `apps/docs/.vitepress/dist/`, `apps/docs/node_modules/`는 gitignore로 제외됩니다. 빌드 산출물을 커밋하지 마세요.
4. SSO 도메인이 변경되면 `apps/docs/developers/quick-start.md`, `apps/docs/developers/sso-integration.md` 등의 예시 URL도 함께 갱신해야 합니다.
5. 빌드 검증 시 문서 사이트(`bun run build:docs` 또는 `bun run --filter @auth-econovation/docs build`)와 React 앱들(`bun run build`)이 **모두 0 종료 코드**로 끝나는지 확인하세요.
