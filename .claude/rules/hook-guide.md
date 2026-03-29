---
description: React hook 가이드라인입니다.
paths: ["src/hooks/**/*.ts"]
---

# react hook 가이드라인

## 개요

React hook을 작성할 때 지켜야하는 가이드라인입니다. 아래의 규칙을 준수하여 일관된 코드 스타일과 유지보수성을 확보하세요.

## 핵심 개념

커스텀 훅의 경우 도메인 로직을 다루는 훅과, 도메인 로직을 다루지 않는 훅으로 나뉩니다. 도메인 로직을 다루는 훅은 feature 훅으로, 도메인 로직을 다루지 않는 훅은 common 훅으로 분류됩니다.

e.g.

- useHaptic, useSMS 는 common 훅입니다.
- useInvalidHaptic, useMemberInfoSMS 는 feature 훅입니다.

## 훅 파일 구조

모든 훅은 index.ts 파일로 작성되어야 합니다.
훅의 이름과 동일한 디렉토리를 만들고, 그 안에 index.ts 파일을 작성하는 형태로 훅을 작성합니다.

## feature 훅

도메인 로직을 다루는 훅은 feature 훅으로 분류됩니다. feature 훅은 common 훅에서 도메인만 붙인 형태로 작성되어야 합니다.
이에 따라 feature 훅은 /src/hooks/feature/ 디렉토리에, 사용된 common 훅끼리 디랙토리로 묶어서 작성되어야 합니다.

아래와 같은 폴더 구조를 가질 수 있습니다.
e.g.

- src/hooks/common/useHaptic/index.ts

- src/hooks/feature/haptic/useInvalidAccessHaptic/index.ts
- src/hooks/feature/haptic/useSuccessPaymentHaptic/index.ts

## checklist

- [ ] 커스텀 훅은 index.ts 파일로 작성되어야 합니다.
- [ ] 훅의 이름과 동일한 디렉토리를 만들고, 그 안에 index.ts 파일을 작성하는 형태로 훅을 작성해야 합니다.
- [ ] 도메인 로직을 다루는 훅은 feature 훅으로, 도메인 로직을 다루지 않는 훅은 common 훅으로 분류되어야 합니다.
- [ ] feature 훅은 common 훅에서 도메인만 붙인 형태로 작성되어야 합니다.
- [ ] feature 훅은 /src/hooks/feature/ 디렉토리에, 사용된 common 훅끼리 디랙토리로 묶어서 작성되어야 합니다.
