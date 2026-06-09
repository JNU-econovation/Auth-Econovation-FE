---
title: 라우팅 · SPA Fallback
description: src/App.tsx 라우트와 vercel.json rewrite 규칙의 동작 방식
---

# 라우팅 · SPA Fallback

## 클라이언트 라우트

`src/App.tsx`에서 React Router v7로 두 개의 라우트를 정의합니다.

```tsx
import { Routes, Route } from "react-router";
import LoginPage from "@app/LoginPage";
import SignUpPage from "@app/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/sign-in" element={<SignUpPage />} />
    </Routes>
  );
}

export default App;
```

| 경로 | 컴포넌트 | 의미 |
| --- | --- | --- |
| `/` | `LoginPage` (`src/app/LoginPage.tsx`) | 로그인 화면 |
| `/sign-in` | `SignUpPage` (`src/app/SignUpPage.tsx`) | 회원가입 화면 (URL 경로명은 `sign-in`이지만 실제로는 회원가입) |

> 경로명과 의미의 미스매치(`/sign-in`이 회원가입)는 외부에 노출된 URL이므로 함부로 변경하지 마세요. 변경 시 SSO를 사용하는 모든 외부 서비스와 사용자 북마크가 깨질 수 있습니다.

## Vercel SPA Fallback (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

이 설정은 **모든 경로 요청을 `/`로 rewrite**합니다. 그 결과:

- `/sign-in`을 직접 입력해도 서버는 `/index.html`을 응답합니다.
- 그 다음 클라이언트의 React Router가 실제 URL(`/sign-in`)을 보고 `SignUpPage`를 렌더링합니다.

이 방식의 의미와 부작용:

- **장점**: SPA 라우트가 새로고침/직접 진입에도 정상 동작합니다.
- **부작용 1 — 정적 파일 충돌 위험**: `/`가 아닌 어떤 경로에도 같은 HTML이 응답되므로, 만일 정적 파일이 필요한 경로(`/robots.txt` 등)를 추가하려면 rewrite보다 **앞선 우선순위의 라우트**가 필요합니다. 현재는 그런 라우트가 없습니다.
- **부작용 2 — 본 문서 사이트 분리 필수**: 같은 Vercel 프로젝트에 문서 경로를 추가하면 rewrite로 인해 모두 `/`(로그인 페이지)로 흡수됩니다. 이 때문에 [문서 사이트는 별도 Vercel 프로젝트](./deployment)로 배포합니다.

## SSO 콜백 처리 흐름

로그인 페이지(`/`)는 URL 쿼리 파라미터로 받은 `redirect-url`을 검증하고, 로그인 성공 후 **SSO 백엔드가 발급한 일회용 임시 토큰(`code`)**을 부착해 해당 URL로 `window.location` 이동시킵니다. 실제 AT/RT는 클라이언트 서비스 서버가 SSO 백엔드와 **별도의 서버 사이드 토큰 교환**으로 수령합니다(URL에는 노출되지 않음).

- 쿼리 파라미터 처리 위치: `src/components/feature/pages/login/LoginFormSection/index.tsx`
- `redirect-url` 검증 규칙: `http://` 또는 `https://` 프로토콜만 허용 (자세한 사양은 [개발자 가이드](../developers/sso-integration#redirect-url-검증-규칙))
- 임시 토큰 교환 흐름은 [개발자 가이드 — SSO 로그인 연동](../developers/sso-integration#전체-흐름) 참조

## 라우트 추가 시 체크리스트

새 페이지를 추가하는 경우 다음을 모두 확인하세요.

1. `src/app/` 아래 페이지 컴포넌트 생성 (라우트 1:1)
2. `src/App.tsx`에 `<Route>` 등록
3. 페이지 본문은 `src/components/feature/pages/<page>/` 아래 섹션으로 분리
4. 새 경로가 인증이 필요한 페이지라면 토큰 가드 로직을 추가
5. 외부에 안내해야 한다면 [개발자 가이드](../developers/) 갱신
