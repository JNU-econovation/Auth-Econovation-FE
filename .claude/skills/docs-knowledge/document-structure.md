# 문서 구조 (세 갈래 독자)

> `docs-knowledge` 스킬의 일부입니다. 진입점은 [SKILLS.md](./SKILLS.md)를 참조하세요.

| 섹션                    | 대상 독자                    | 주요 내용                                            |
| ----------------------- | ---------------------------- | ---------------------------------------------------- |
| `apps/docs/users/`      | 동아리 회원(일반 사용자)     | 회원가입, 로그인, 기존 계정 연결, FAQ                |
| `apps/docs/developers/` | 외부 통합 개발자             | SSO 연동 흐름, API 명세, 콜백/토큰 처리, 에러 코드   |
| `apps/docs/operators/`  | 본 레포 유지보수/배포 담당자 | 아키텍처, 환경 변수, 라우팅, 테스트, 배포, 운영 런북 |

- 사이트 진입점: `apps/docs/index.md` (VitePress home layout)
- 사이드바/네비게이션 정의: `apps/docs/.vitepress/config.ts`
- 언어: `ko-KR`, `cleanUrls: true`, `editLink`는 **develop 브랜치 + `apps/docs/` 경로** 기준
