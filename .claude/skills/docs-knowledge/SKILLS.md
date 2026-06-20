---
name: docs-knowledge
description: 해당 프로젝트의 공식 문서(apps/docs/...)에 대한 정보 정리입니다. 공식 문서를 수정할 때 읽으세요.
---

## Documentation Site (`apps/docs/`)

**[주의]** 절대로 apps/docs/ 기반으로 개발하지 마세요. 개발의 결과가 docs/ 이며, 개발은 독립적이어야합니다. 개발이 완료된 이후에 docs/를 수정하는 방식으로 진행하세요.
**[주의]** 코드와 apps/docs/ 가 충돌하는 경우에는 무조건적으로 코드가 맞습니다. 충돌하는 경우 물어보지말고 무조건 코드를 따르세요

`apps/docs/` 디렉터리는 **VitePress 기반 공식 문서 사이트**이며, 모노레포(Bun workspaces)의 한 워크스페이스(`@auth-econovation/docs`)입니다. 자체 `package.json` / `.vitepress/` 구성을 가지며, **독립된 Vercel 프로젝트**(Root Directory = `apps/docs`)로 배포됩니다. (lockfile은 루트 통합 `bun.lockb` 하나로 관리하며, `apps/docs`는 개별 lockfile을 두지 않습니다.)

세부 내용은 아래 문서를 참조하세요. (모두 동일 폴더에 위치)

- [문서 구조 (세 갈래 독자)](./document-structure.md) — 섹션별 대상 독자, 사이트 진입점/사이드바/언어 설정
- [작성·수정 시 주의사항](./writing-guidelines.md) — sidebar 등록, 링크 규칙, frontmatter, 소스 경로 인용, 인증 흐름 표기
- [의존성·배포 관련 주의사항](./dependency-deployment.md) — docs 의존성 관리, Vercel 프로젝트 분리, gitignore, 빌드 검증
