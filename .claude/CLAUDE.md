# CLAUDE.md

## Project Overview

auth-econovation은 에코노베이션 서비스들에게 통합 로그인(SSO)을 제공하는 프론트엔드 애플리케이션입니다.
OAuth2.0 Provider와 유사한 방식으로 동작하며, 사용자가 한 번 로그인하면 연결된 모든 서비스에서 동일한 계정으로 인증됩니다.

본 레포는 **Bun workspaces 모노레포**입니다 — `apps/{web,console,docs}` + `packages/{ui,api}`. 구조·명령어는 `development-knowledge`, 배포 절차는 `apps/docs/operators/deployment.md`를 참조하세요.

**비즈니스 로직과 도메인 요구사항은 `domain-knowledge` skills를 참조하세요.**
**개발 관련(빌드, 기술스택, 포매팅 등) 정보가 필요하다면 `development-knowledge` skills를 참조하세요.**
**배포된 공식 문서 관련 정보가 필요하다면 `docs-knowledge` skills를 참조하세요.**
**기술 문서를 작성하거나 개선·리뷰할 때는 `technical-writing` skill을 사용하세요.** 문서 유형 → 정보 구조 → 문장 다듬기 3단계로 전문 에이전트(`tw-type-classifier`, `tw-structure-reviewer`, `tw-sentence-polisher`)를 호출합니다. 기준 문서는 `context/technical-writing/`에 있습니다.

console 워크스페이스에 대한 api관련 정보가 필요하다면 `context/api-docs/console/index.md` 를 확인하세요
web 워크스페이스에 대한 api관련 정보가 필요하다면 `context/api-docs/auth/index.md` 를 확인하세요

**Vercel 배포를 다루거나 배포 작업을 할 때는 먼저 `context/deploy/index.md`를 확인하세요.** 5개 Vercel 프로젝트(web·console의 dev/prod, docs)의 대표 도메인·환경변수·빌드 설정·Production 브랜치가 정리되어 있으며, 프로젝트별 상세는 `context/deploy/<프로젝트명>.md`에 있습니다.
