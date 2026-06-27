/**
 * Gateway 라우트 검증 규칙(어드민 라우트 · 셀프 클라이언트 라우트 공용).
 *
 * 실제 백엔드는 네임스페이스 정책·SSRF 차단을 정교하게 수행하지만, 모킹에서는
 * 문서(`context/api-docs/console/`)에 명시된 에러 코드를 재현할 수 있을 만큼의
 * 단순 휴리스틱만 둡니다.
 */

/**
 * @description `pathPrefix`가 `/api/{namespace}` 형태인지 검사합니다.
 * `/api/` 뒤에 비어 있지 않은 세그먼트가 1개 이상 와야 합니다(`/api/my-service/**` 등 허용).
 */
export const isValidNamespacePrefix = (pathPrefix: string): boolean =>
  /^\/api\/[A-Za-z0-9._~-]+(\/.*)?$/.test(pathPrefix);

/**
 * @description `pathPrefix`에서 네임스페이스(`/api/` 다음 첫 세그먼트)를 추출합니다.
 * 형식이 올바르지 않으면 빈 문자열을 반환합니다.
 */
export const extractNamespace = (pathPrefix: string): string => {
  const match = /^\/api\/([A-Za-z0-9._~-]+)/.exec(pathPrefix);
  return match ? match[1] : "";
};

/**
 * @description `upstreamUrl`이 안전한 http(s) URL인지 검사합니다(SSRF 모의 차단).
 * 파싱 불가하거나 http/https가 아니면 무효로 간주합니다.
 */
export const isValidUpstreamUrl = (upstreamUrl: string): boolean => {
  try {
    const url = new URL(upstreamUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
