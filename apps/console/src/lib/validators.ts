/**
 * 콘솔 폼의 클라이언트측 입력 검증 유틸.
 */

/** UUID(v1~v5) 형식 여부. 공백을 트림한 뒤 검사합니다. */
export const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );

/** 절대 URL 형식 여부(URL 생성자 파싱 성공 기준). */
export const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/** 식별자를 앞 8자 + 말줄임(…)으로 축약합니다. 테이블 등 좁은 영역 표시용. */
export const shortId = (id: string): string => `${id.slice(0, 8)}…`;
