import { http, HttpResponse } from "msw";
import { MEMBERS_BATCH_API_PATH } from "./constants";
import { db, toPublicMemberView } from "./db";
import { errorResponse } from "./errors";

/**
 * 그룹 4. 외부 연동 회원 정보 조회 핸들러 (`context/sso-api/client-service.md`).
 *
 * POST /api/v1/members/batch — ID 목록으로 회원 정보 조회(단건도 동일 엔드포인트).
 * 존재하지 않는 ID는 결과에서 조용히 제외(에러 아님). 0건이어도 200 + 빈 배열.
 */

const MAX_IDS = 1000;

export const membersHandlers = [
  http.post(`*${MEMBERS_BATCH_API_PATH}`, async ({ request }) => {
    let body: { ids?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return errorResponse("VALIDATION_FAILED");
    }

    const { ids } = body;

    // ids: 1개 이상 1000개 이하의 숫자 배열
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.length > MAX_IDS ||
      !ids.every((id) => typeof id === "number" && Number.isInteger(id))
    ) {
      return errorResponse("VALIDATION_FAILED");
    }

    const idSet = new Set<number>(ids as number[]);
    const result = db.members
      .filter((m) => idSet.has(m.memberId))
      .map(toPublicMemberView);

    return HttpResponse.json(result);
  }),
];
