---
layout: home
title: auth-econovation 공식 문서
titleTemplate: 에코노베이션 통합 인증(SSO)

hero:
  name: auth-econovation
  text: 에코노베이션 통합 인증 공식 문서
  tagline: 동아리 회원, 통합 개발자, 운영자를 위한 세 갈래 가이드
  actions:
    - theme: brand
      text: 개발자 Quick Start
      link: /developers/quick-start
    - theme: alt
      text: 사용자 가이드
      link: /users/
    - theme: alt
      text: 운영자 가이드
      link: /operators/

features:
  - icon: 👤
    title: 사용자
    details: 동아리 회원으로 회원가입하고 로그인하며, 자주 발생하는 문제를 해결하는 방법을 안내합니다.
    link: /users/
    linkText: 사용자 가이드 열기
  - icon: 🧩
    title: 통합 개발자
    details: 자신의 서비스(웹/앱)에 SSO를 연동하는 방법, API 명세, 에러 코드, 토큰 처리 가이드를 제공합니다.
    link: /developers/
    linkText: 개발자 가이드 열기
  - icon: 🛠️
    title: 운영자
    details: 본 레포지토리의 아키텍처, 환경 변수, 라우팅, 배포 절차, 운영 런북을 정리한 내부 운영 가이드입니다.
    link: /operators/
    linkText: 운영자 가이드 열기
---

## 이 사이트에 대해

`auth-econovation`은 에코노베이션 동아리 산하 서비스들이 공유하는 **단일 인증(SSO) 프론트엔드**입니다. 본 문서는 다음 세 종류의 독자를 위해 세 갈래로 나뉘어 있습니다.

| 섹션 | 누구를 위한 글인가 | 무엇을 다루는가 |
| --- | --- | --- |
| [사용자](/users/) | 동아리 회원으로 가입·로그인하는 일반 사용자 | 회원가입 절차, 로그인, 기존 계정 연결, 문제 해결 |
| [개발자](/developers/) | 자기 서비스에 SSO를 붙이려는 외부 개발자 | SSO 연동 흐름, API 명세, 콜백 처리, 토큰 사용 |
| [운영자](/operators/) | 본 레포를 유지보수·배포하는 내부 개발자 | 아키텍처, 환경 변수, 라우팅, 배포, 운영 런북 |

> 본 문서는 `auth-econovation` 레포의 `docs/` 디렉터리에서 관리되며, 각 페이지 하단의 **"GitHub에서 이 페이지 수정"** 링크로 직접 기여할 수 있습니다.
