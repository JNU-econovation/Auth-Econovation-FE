import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "ko-KR",
  title: "auth-econovation 문서",
  description: "에코노베이션 통합 인증(SSO) 공식 문서",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "사용자", link: "/users/" },
      { text: "개발자", link: "/developers/" },
      { text: "운영자", link: "/operators/" },
    ],
    sidebar: {
      "/users/": [
        {
          text: "사용자 가이드",
          items: [
            { text: "소개", link: "/users/" },
            { text: "회원가입", link: "/users/sign-up" },
            { text: "로그인", link: "/users/sign-in" },
            { text: "기존 계정 연결", link: "/users/account-linking" },
            { text: "자주 묻는 질문", link: "/users/faq" },
          ],
        },
      ],
      "/developers/": [
        {
          text: "통합 개발자 가이드",
          items: [
            { text: "서비스 개요", link: "/developers/" },
            { text: "Quick Start", link: "/developers/quick-start" },
            { text: "SSO 로그인 연동", link: "/developers/sso-integration" },
            { text: "클라이언트 예시", link: "/developers/client-examples" },
            { text: "회원가입 페이지 진입", link: "/developers/sign-up-page" },
            { text: "API 명세", link: "/developers/api-reference" },
            { text: "에러 코드", link: "/developers/error-codes" },
            { text: "토큰 사용 가이드", link: "/developers/token-guide" },
            { text: "FAQ / 트러블슈팅", link: "/developers/faq" },
          ],
        },
      ],
      "/operators/": [
        {
          text: "운영자 가이드",
          items: [
            { text: "아키텍처 개요", link: "/operators/" },
            { text: "환경 변수 · Alias", link: "/operators/environment" },
            { text: "라우팅 · SPA Fallback", link: "/operators/routing" },
            { text: "API 레이어", link: "/operators/api-layer" },
            { text: "테스트", link: "/operators/testing" },
            { text: "배포", link: "/operators/deployment" },
            { text: "운영 런북", link: "/operators/runbook" },
          ],
        },
      ],
    },
    search: { provider: "local" },
    socialLinks: [
      { icon: "github", link: "https://github.com/econovation/auth-econovation" },
    ],
    outline: { level: [2, 3], label: "목차" },
    editLink: {
      pattern:
        "https://github.com/econovation/auth-econovation/edit/develop/docs/:path",
      text: "GitHub에서 이 페이지 수정",
    },
    docFooter: {
      prev: "이전 페이지",
      next: "다음 페이지",
    },
    lastUpdatedText: "마지막 업데이트",
  },
});
