# 작성·수정 시 주의사항

> `docs-knowledge` 스킬의 일부입니다. 진입점은 [SKILLS.md](./SKILLS.md)를 참조하세요.

1. **신규 페이지 추가 시 반드시 `apps/docs/.vitepress/config.ts`의 sidebar에 등록**해야 사이드바에 노출됩니다. 등록하지 않으면 빌드는 되지만 탐색이 불가능합니다.
2. **내부 링크는 확장자 없이 작성**합니다 (`cleanUrls: true`). 예: `/developers/quick-start` (`.md` 붙이지 않음).
3. **상대 경로 링크**를 사용하면 섹션 간 이동이 안전합니다. 예: `../developers/sso-integration`.
4. 페이지 frontmatter에는 가능한 한 `title`, `description`을 명시합니다.
5. **소스 코드 경로를 인용할 때**는 `apps/docs/developers/index.md` / `apps/docs/operators/index.md` 의 "관련 소스 코드 위치" 표 형식을 따라 실제 파일 경로(SSO 앱은 `apps/web/src/...`, 공유 코드는 `packages/...`)와 함께 표기합니다. 리팩토링 시 이 경로들도 함께 갱신해야 합니다.
6. **인증 흐름 관련 표기는 실제 코드(`packages/api/src/auth/...` + `domain-knowledge` 스킬)를 단일 진실로 따릅니다.** 현재 구현은 _authorization code 교환 단계가 없는_ **직접 토큰 발급** 방식입니다 — 로그인 응답으로 WEB은 AT/RT를 HttpOnly 쿠키, APP은 응답 바디(`accessToken`/`refreshToken`)로 받고, 서버가 내려준 `redirectUrl`로 프론트가 전체 이동합니다. 진입 쿼리는 `client-id`(필수)·`client-type`(`web`|`app`, 기본 `web`)이고, 백엔드 요청 헤더는 `Client-Type: WEB|APP`입니다. 문서에 "임시 토큰 교환(Authorization Code Exchange)/`code`/서버 사이드 교환/오리진 검증" 같은 _미구현_ 표현이 남아 있으면 위 직접 발급 흐름으로 정렬하세요. 미확정 항목은 임의로 채우지 말고 `*(TBD: ...)*` 표기로 명시합니다.
