---
name: development-knowledge
description: 해당 프로젝트의 개발시에 필요한 정보들에 대한 정리입니다. 빌드 명령, 기술 스택, 코드 포매팅, 빌드 설정에 대한 정보가 필요하면 이 스킬을 읽으세요
---

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
