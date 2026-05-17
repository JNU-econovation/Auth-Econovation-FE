---
title: 운영자 가이드
description: auth-econovation 레포의 아키텍처, 진입점, 의존성 한눈에 보기
---

# 운영자 가이드

`auth-econovation` 레포를 직접 유지보수·배포하는 **내부 개발자**를 위한 문서입니다. 외부 서비스 연동 흐름은 [개발자 가이드](../developers/), 일반 회원 사용법은 [사용자 가이드](../users/)를 참고하세요.

## 한눈에 보는 기술 스택

| 항목 | 값 |
| --- | --- |
| 패키지 매니저 / 런타임 | Bun |
| UI 라이브러리 | React 19 + TypeScript |
| 라우팅 | React Router v7 |
| 빌드 도구 | Vite 6 (+ `@vitejs/plugin-react-swc`) |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 상태 / 서버 통신 | `@tanstack/react-query`, `axios` |
| 테스트 | Vitest (`environment: node`, `pool: forks`) |
| 호스팅 | Vercel (SPA fallback rewrite) |

## 진입점 및 라우트

| 위치 | 역할 |
| --- | --- |
| `src/main.tsx` | React 진입점, `<BrowserRouter>` 등 마운트 |
| `src/App.tsx` | 라우트 정의: `/` → `LoginPage`, `/sign-in` → `SignUpPage` |
| `src/app/LoginPage.tsx` | 로그인 페이지 (`/`) |
| `src/app/SignUpPage.tsx` | 회원가입 페이지 (`/sign-in`) |

> 페이지가 두 개뿐인 매우 가벼운 SPA입니다. 페이지를 추가할 때는 `src/components/feature/pages/` 패턴(섹션 단위 분리)을 유지하세요.

## 디렉터리 개요

```
src/
├─ main.tsx                  # 진입점
├─ App.tsx                   # 라우트
├─ app/                      # 페이지 컴포넌트(라우트 1:1)
├─ api/                      # axios 인스턴스 + 도메인별 API 호출
├─ components/
│   ├─ common/{shared,entities}/
│   └─ feature/{pages,widget}/
├─ hooks/                    # 커스텀 훅
├─ lib/                      # 순수 유틸리티
├─ __tests__/                # vitest 테스트
└─ assets/                   # 정적 에셋
```

## 운영자 가이드 페이지

| 문서 | 다루는 주제 |
| --- | --- |
| [환경 변수 · Alias](./environment) | `VITE_API_URL`, Vite alias 7종, `.env` 위치 |
| [라우팅 · SPA Fallback](./routing) | `src/App.tsx` 라우트와 `vercel.json` rewrite 규칙 |
| [API 레이어](./api-layer) | axios 인스턴스 구성과 `src/api/` 트리 |
| [테스트](./testing) | `vitest.config.ts`, `src/__tests__/` 구성 |
| [배포](./deployment) | Vercel 프로젝트 구성(SSO 앱 / 본 문서 사이트 분리) |
| [운영 런북](./runbook) | 자주 발생하는 운영 이슈 대응 절차 템플릿 |
