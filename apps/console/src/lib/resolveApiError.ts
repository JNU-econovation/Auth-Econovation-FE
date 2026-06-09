import axios from "axios";
import type { ApiErrorResponse } from "@auth-econovation/api";

/**
 * @description 공유 API 에러 응답(`{ errorCode, message, timestamp }`)에서 사용자 표시 메시지를 추출합니다.
 * axios 에러가 아니거나 응답 바디가 없으면 `fallback`을 반환합니다.
 * @param error - catch로 잡힌 알 수 없는 에러
 * @param fallback - 메시지를 얻지 못했을 때의 기본 문구
 * @returns 사용자에게 보여줄 에러 메시지
 */
export const resolveApiErrorMessage = (
  error: unknown,
  fallback = "요청 처리 중 오류가 발생했습니다.",
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
};
