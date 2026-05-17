---
title: 배포
description: SSO 앱과 본 문서 사이트의 Vercel 프로젝트 구성
---

# 배포

본 레포는 **하나의 Git 저장소**에 두 개의 배포 가능한 산출물을 가지고 있습니다.

| 배포 대상 | 빌드 디렉터리 | 도메인 |
| --- | --- | --- |
| SSO 프론트엔드 (메인 앱) | 레포 루트 | `auth.econovation.kr` (예시) |
| 본 공식 문서 사이트 | `docs/` | `docs.auth.econovation.kr` (예시) |

> 두 산출물은 **각각 별도의 Vercel 프로젝트**로 배포합니다. 같은 Vercel 프로젝트에 두면 `vercel.json`의 SPA fallback rewrite(`/(.*) → /`) 때문에 문서 경로가 모두 로그인 페이지로 흡수됩니다.

## 1) SSO 프론트엔드 (메인 앱)

| 항목 | 값 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | (레포 루트) |
| Install Command | `bun install` |
| Build Command | `bun run build` |
| Output Directory | `dist` |
| Environment Variables | `VITE_API_URL` (Production / Preview 분리) |
| SPA Fallback | `vercel.json`의 `rewrites` 규칙으로 처리 |

`vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

이 rewrite는 **모든 경로**를 SPA 진입점으로 흡수합니다. React Router가 클라이언트에서 실제 라우트(`/`, `/sign-in`)를 분기합니다.

## 2) 공식 문서 사이트 (본 사이트)

| 항목 | 값 |
| --- | --- |
| Framework Preset | Other (또는 VitePress) |
| **Root Directory** | **`docs`** |
| Install Command | `bun install` |
| Build Command | `bun run build` (= `vitepress build`) |
| Output Directory | `.vitepress/dist` |
| Environment Variables | 없음 |

### Vercel 프로젝트 생성 절차

1. Vercel 대시보드에서 **Add New… → Project** 클릭
2. 같은 GitHub 레포(`auth-econovation`)를 import
3. 프로젝트 이름 예: `auth-econovation-docs`
4. **Root Directory** 를 `docs` 로 변경 (가장 중요)
5. Framework Preset이 자동 감지되지 않으면 **Other** 선택 후 위 명령을 직접 입력
6. 첫 배포 후 도메인 메뉴에서 `docs.auth.econovation.kr` 등 커스텀 도메인 추가
7. DNS는 동아리 도메인 운영자가 CNAME으로 Vercel에 연결

### 빌드 산출물 확인

로컬에서 동일한 산출물을 만들려면 레포 루트에서 다음을 실행합니다.

```bash
bun run docs:install   # 최초 1회
bun run docs:build     # docs/.vitepress/dist 생성
bun run docs:preview   # 빌드된 정적 사이트 미리보기
```

### 메인 앱 회귀 방지

- 메인 앱의 `package.json` / `vite.config.ts` / `vercel.json` 은 **변경하지 마세요**. 변경 시 SSO 라우팅 / 토큰 콜백 흐름이 깨질 수 있습니다.
- `docs/` 디렉터리는 독립된 `package.json`과 `bun.lockb`를 갖습니다. 의존성 변경은 반드시 `cd docs && bun add ...` 형태로 수행하세요.
- 빌드 검증 시 메인 앱(`bun run build`)과 문서 사이트(`bun run docs:build`)가 **둘 다 0 종료 코드**로 끝나는지 확인하세요.

## 도메인 / DNS 변경

- 도메인이 변경되면 [개발자 가이드 — Quick Start](../developers/quick-start), [SSO 로그인 연동](../developers/sso-integration) 의 예시 URL도 함께 갱신하세요.
- 외부 서비스가 하드코딩한 SSO URL이 있을 수 있으므로, 도메인 변경 전 동아리 채널에 사전 공지가 필요합니다.
