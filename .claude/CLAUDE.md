# CLAUDE.md

## Project Overview

auth-econovation은 에코노베이션 서비스들에게 통합 로그인(SSO)을 제공하는 프론트엔드 애플리케이션입니다.
OAuth2.0 Provider와 유사한 방식으로 동작하며, 사용자가 한 번 로그인하면 연결된 모든 서비스에서 동일한 계정으로 인증됩니다.

본 레포는 **Bun workspaces 모노레포**입니다 — `apps/{web,console,docs}` + `packages/{ui,api}`. 구조·명령어는 `development-knowledge`, 배포(3개 Vercel 프로젝트)는 `apps/docs/operators/deployment.md`를 참조하세요.

**비즈니스 로직과 도메인 요구사항은 `domain-knowledge` skills를 참조하세요.**
**개발 관련(빌드, 기술스택, 포매팅 등) 정보가 필요하다면 `development-knowledge` skills를 참조하세요.**
**배포된 공식 문서 관련 정보가 필요하다면 `docs-knowledge` skills를 참조하세요.**
