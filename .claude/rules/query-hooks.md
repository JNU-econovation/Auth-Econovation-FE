---
description: React Query를 활용한 API 통신을 위한 커스텀 훅 작성 가이드라인입니다.
paths: ["src/hooks/**/*.ts"]
---

# query hooks 가이드라인

## 개요

React Query를 활용한 API 통신을 위한 커스텀 훅 작성 가이드라인입니다. 아래의 규칙을 준수하여 일관된 코드 스타일과 유지보수성을 확보하세요.

## 디랙토리 구조

- `src/hooks/features/` 디렉토리에 API 요청과 관련된 커스텀 훅을 작성합니다.
- tanstack-query 를 래핑한 커스텀 훅들은 `src/hooks/features/query/` 디렉토리에 작성합니다.
- query 훅은 `src/hooks/features/query/querys/` 디렉토리에 작성합니다.
- mutation 훅은 `src/hooks/features/query/mutations/` 디렉토리에 작성합니다.
- prefetch 훅은 `src/hooks/features/query/preFetchs/` 디렉토리에 작성합니다.
- suspenseQuery 훅은 `src/hooks/features/query/suspenseQuerys/` 디렉토리에 작성합니다.

### checklist

- [ ] API 요청과 관련된 커스텀 훅은 `src/hooks/features/query/` 디렉토리에 작성되어야 합니다.
- [ ] 커스텀 훅은 `use` 접두어로 시작하는 명명 규칙을 따릅니다 (예: `useSignUp`).
- [ ] query 훅은 `src/hooks/features/query/querys/` 디렉토리에 작성되어야 합니다.
- [ ] mutation 훅은 `src/hooks/features/query/mutations/` 디렉토리에 작성되어야 합니다.
- [ ] prefetch 훅은 `src/hooks/features/query/preFetchs/` 디렉토리에 작성되어야 합니다.
- [ ] suspenseQuery 훅은 `src/hooks/features/query/suspenseQuerys/` 디렉토리에 작성되어야 합니다.

## tanstack-query 커스텀 훅 작성 규칙

- useQuery, useMutation, usePrefetchQuery, useSuspenseQuery 훅을 그대로 return 하는 형태로 작성합니다.
- key는 API 경로와 일치하도록 작성합니다. 부가적으로 필요한 경우, key에 추가적인 식별자를 포함할 수 있습니다.
- 훅의 인자의 경우 interface로 정의합니다.

```typescript
// src/hooks/features/query/querys/useBasesDetailQuery/index.ts
import { BASES_DETAIL_API_PATH, getBasesDetailApi } from "api";
import { useQuery } from "@tanstack/react-query";
import authenticatedApi from "@api/_instances/authenticatedApi";

interface BasesDetailQueryProps {
  mountainId: string;
}

const useBasesDetailQuery = ({ mountainId }: BasesDetailQueryProps) => {
  return useQuery({
    queryKey: [BASES_DETAIL_API_PATH(mountainId)],
    queryFn: () => getBasesDetailApi(authenticatedApi, mountainId),
  });
};

export default useBasesDetailQuery;
```

### checklist

- [ ] 커스텀 훅은 useQuery, useMutation, usePrefetchQuery, useSuspenseQuery 훅을 그대로 return 하는 형태로 작성되어야 합니다.
- [ ] key는 API 경로와 일치하도록 작성되어야 합니다. 부가적으로 필요한 경우, key에 추가적인 식별자를 포함할 수 있습니다.
