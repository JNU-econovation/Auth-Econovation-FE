---
title: 배포
description: SSO 웹·콘솔·문서 사이트의 Vercel 프로젝트 구성 (Bun workspaces 모노레포)
---

# 배포

본 레포는 **하나의 Git 저장소(Bun workspaces 모노레포)** 에 세 개의 배포 가능한 산출물을 가지고 있습니다.

| 배포 대상 | Root Directory | Framework | Output | rewrite |
| --- | --- | --- | --- | --- |
| SSO 웹 (메인 앱) | `apps/web` | Vite | `apps/web/dist` | **SPA `/(.*)→/`** |
| 어드민/개발자 콘솔 | `apps/console` | Vite | `apps/console/dist` | **SPA `/(.*)→/`** |
| 공식 문서 사이트 | `apps/docs` | Other(VitePress) | `apps/docs/.vitepress/dist` | 없음 |

> 세 산출물은 **각각 별도의 Vercel 프로젝트**로 배포합니다. React 앱(web·console)의 SPA fallback rewrite를 docs와 공유하면 문서 경로가 모두 진입점으로 흡수됩니다.

## 반드시 지킬 원칙

1. **SPA fallback rewrite는 절대 공유·통합 금지.** React 앱(web·console)은 각자 디렉토리의 `vercel.json`에만 rewrite를 둡니다. 한 프로젝트에 섞으면 docs/콘솔 경로가 흡수됩니다.
2. **각 사이트는 독립 Vercel 프로젝트.** 모노레포여도 프로젝트 분리를 유지합니다(현행과 동일).
3. **Bun workspace 빌드.** Root Directory를 앱 디렉토리로 두되, Vercel **"Include source files outside of the Root Directory"**(모노레포) 옵션을 켜서 `packages/*`(공유 ui/api)에 접근할 수 있게 합니다. Install은 루트 통합 `bun install`을 사용합니다.
4. **환경변수.** `VITE_API_URL`은 web·console 각 프로젝트에 개별 설정합니다(같은 백엔드, 콘솔은 어드민 엔드포인트 사용). 콘솔은 추가로 `VITE_SSO_LOGIN_URL`이 **필수**입니다(미설정 시 `src/env.ts`가 부팅 시점에 throw하여 화면이 뜨지 않음). 콘솔은 프로덕션에서 MSW를 사용하지 않습니다(`VITE_ENABLE_MSW` 미설정 또는 `false`).
5. **Vite 환경변수는 빌드 타임에 번들로 인라인됩니다.** 런타임이 아니라 **빌드 시점**에 값이 고정되므로, 환경변수를 추가·변경하면 반드시 **재배포**해야 반영됩니다. `VITE_DEV_*`(web)·MSW 관련 변수는 개발 전용이므로 프로덕션 프로젝트에는 설정하지 않습니다.

## 공통 Vercel 설정 (web·console·docs)

| 항목 | 값 |
| --- | --- |
| Install Command | `bun install` (루트 통합 `bun.lockb`) |
| Include source files outside of the Root Directory | **활성화** (web·console은 `packages/*` 접근에 필수) |

## 1) SSO 웹 (메인 앱)

| 항목 | 값 |
| --- | --- |
| Framework Preset | Vite |
| **Root Directory** | **`apps/web`** |
| Build Command | `bun run build` (= `vite build`) |
| Output Directory | `dist` (= `apps/web/dist`) |
| Environment Variables | `VITE_API_URL` **(필수)** · `VITE_ENABLE_MSW`=`false`/미설정 (dev 전용 `VITE_DEV_CLIENT_ID`·`VITE_DEV_CLIENT_TYPE`는 프로덕션 불필요) |
| SPA Fallback | `apps/web/vercel.json` |

`apps/web/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

이 rewrite는 **모든 경로**를 SPA 진입점으로 흡수합니다. React Router가 클라이언트에서 실제 라우트(`/`, `/sign-in`)를 분기합니다.

## 2) 어드민/개발자 콘솔

| 항목 | 값 |
| --- | --- |
| Framework Preset | Vite |
| **Root Directory** | **`apps/console`** |
| Build Command | `bun run build` (= `vite build`) |
| Output Directory | `dist` (= `apps/console/dist`) |
| Environment Variables | `VITE_API_URL` **(필수, 어드민 엔드포인트)** · `VITE_SSO_LOGIN_URL` **(필수)** · `VITE_ENABLE_MSW`=`false`/미설정 |
| SPA Fallback | `apps/console/vercel.json` |

> 콘솔 도메인(예: `console.auth.econovation.kr`)과 인증 방식(SSO 세션 재사용 vs 전용 게이트)은 *(TBD: 운영자 확정)*. 현재 가드는 개발(MSW) 역할 전환 기반이며, 프로덕션은 **세션 쿠키 기반 권한 검증**(미인증 시 SSO 로그인으로 리다이렉트)으로 대체해야 합니다. 또한 콘솔의 "클라이언트 목록" 전용 엔드포인트는 백엔드 계약에 없어 단건 조회 기반으로 동작합니다 *(TBD: 목록 엔드포인트 백엔드 협의)*.

## 3) 공식 문서 사이트

| 항목 | 값 |
| --- | --- |
| Framework Preset | Other (또는 VitePress) |
| **Root Directory** | **`apps/docs`** |
| Build Command | `bun run build` (= `vitepress build`) |
| Output Directory | `.vitepress/dist` |
| Environment Variables | 없음 |

## Vercel 프로젝트 생성 절차 (앱 공통)

1. Vercel 대시보드에서 **Add New… → Project** 클릭
2. 같은 GitHub 레포(`auth-econovation`)를 import
3. 프로젝트 이름 예: `auth-web` / `auth-console` / `auth-docs`
4. **Root Directory** 를 `apps/web` | `apps/console` | `apps/docs` 로 지정 (가장 중요)
5. **"Include source files outside of the Root Directory"** 활성화 (web·console 필수 — `packages/*` 공유 코드 접근)
6. Framework Preset이 자동 감지되지 않으면 Vite(앱) / Other(docs) 선택 후 위 명령을 직접 입력
7. `VITE_API_URL` 환경변수 설정 (web·console)
8. 첫 배포 후 도메인 메뉴에서 커스텀 도메인 추가, DNS는 운영자가 CNAME으로 Vercel에 연결

## 로컬 빌드 검증

레포 루트에서 다음을 실행해 세 산출물을 만듭니다.

```bash
bun install            # 최초 1회 (통합 lockfile)
bun run build          # web·console·docs 전체 빌드
# 또는 개별
bun run build:web
bun run build:console
bun run build:docs
```

세 빌드가 **모두 0 종료 코드**로 끝나는지 확인하세요.

## 도메인 / DNS 변경

- 도메인이 변경되면 [개발자 가이드 — Quick Start](../developers/quick-start), [SSO 로그인 연동](../developers/sso-integration) 의 예시 URL도 함께 갱신하세요.
- 외부 서비스가 하드코딩한 SSO URL이 있을 수 있으므로, 도메인 변경 전 동아리 채널에 사전 공지가 필요합니다.
