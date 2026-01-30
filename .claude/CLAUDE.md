# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

auth-econovation은 에코노베이션 서비스들에게 통합 로그인(SSO)을 제공하는 프론트엔드 애플리케이션입니다. OAuth2.0 Provider와 유사한 방식으로 동작하며, 웹과 앱 클라이언트를 모두 지원합니다.

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
```

## Tech Stack

- **Bun** - 패키지 매니저 및 런타임
- **React 19** with TypeScript - UI 라이브러리
- **Vite** - 빌드 도구 및 개발 서버
- **SWC** - Fast Refresh (via @vitejs/plugin-react-swc)
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
