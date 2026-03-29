---
description: API 요청과 관련된 가이드라인입니다.
paths: ["src/api/*"]
---

# api 가이드라인

## 디랙토리 구조

api 로직은 `src/api` 디렉토리에 작성되어야 합니다. API 요청과 관련된 모든 로직은 이 디렉토리에 위치해야 합니다.

restful API 요청 엔드포인트와 /api/... 디렉토리 위치와 일치해야합니다.

e.g. `POST /api/auth/signup` → `src/api/auth/signup/index.ts`

만약 API 요청과 관련된 추가적인 유틸리티 함수나 타입이 필요한 경우, \_를 붙인 디랙토리를 만들고 그 안에 작성할 수 있습니다.

e.g.

- 유틸 함수가 필요하다면 `src/api/_utils/index.ts` 에 작성할 수 있습니다.
- instance가 필요하다면 `src/api/_instances/[instance-name]/index.ts` 에 작성할 수 있습니다.

## API 요청 로직

API 요청 로직은 index.ts 내에 위치하며, 형식은 아래와 같이 작성되어야 합니다.

```typescript
import { AxiosInstance } from "axios";
import type { FacilityMarker } from "@model/map";

/**
 * @public
 * @category Constants
 * @description 편의시설 목록 조회 API 경로를 생성하는 함수
 * @param mountainId - 산 ID
 * @returns API 경로 문자열
 */
export const FACILITY_API_PATH = (mountainId: string) =>
  `/api/v1/facilities?mountainId=${mountainId}`;

/**
 * @public
 * @category Types
 * @interface GetFacilitiesApiResponse
 * @description 편의시설 목록 조회 응답 타입
 * @property {string} mountainId - 산 ID
 * @property {FacilityMarker[]} facilities - 편의시설 마커 목록
 */
export interface GetFacilitiesApiResponse {
  mountainId: string;
  facilities: FacilityMarker[];
}

/**
 * @public
 * @category Facilities
 * @description 특정 산의 편의시설 목록을 조회합니다 (화장실, 주차장 등)
 * @param mountainId - 산 ID
 * @returns 편의시설 목록
 * @example
 * const result = await getFacilitiesApi("mountain123");
 * console.log(result.facilities); // FacilityMarker[]
 */
export const getFacilitiesApi = async (mountainId: string) => {
  const response = await instance<GetFacilitiesApiResponse>({
    method: "get",
    url: FACILITY_API_PATH(mountainId),
  });

  return response.data;
};
```

형식 설명

- API 경로 생성 함수 혹은 상수는 `FACILITY_API_PATH`와 같이 대문자와 \_로 작성되어야 합니다.
- API 응답 타입의 이름은 `GetFacilitiesApiResponse`와 같이 메서드 형식과 API 요청 로직의 이름, 그리고 ApiResponse를 조합하여 작성되어야 합니다.
- API 요청 함수의 이름은 `getFacilitiesApi`와 같이 API 요청의 목적과 메서드 형식, 그리고 Api를 조합하여 작성되어야 합니다.
- API 요청 함수는 async 함수로 작성되어야 하며, API 요청이 성공했을 때 응답 데이터만 반환하도록 작성되어야 합니다.
- API 요청 함수에는 JSDoc 주석이 포함되어야 하며, @description, @param, @returns, @example 태그를 사용하여 함수의 목적과 매개변수, 반환값, 사용 예시를 명확하게 설명해야 합니다.
