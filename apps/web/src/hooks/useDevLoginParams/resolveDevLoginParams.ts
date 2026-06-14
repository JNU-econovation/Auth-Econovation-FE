/**
 * 개발용 로그인 쿼리 보정 로직(순수 함수).
 *
 * `import.meta.env` 접근과 분리해 두어, node(unit) 환경에서 Vite 런타임 없이도
 * 규칙 자체를 단위 테스트할 수 있습니다. 실제 값 바인딩은 `useDevLoginParams`가 담당합니다.
 */

/** 개발 모드에서 '/' 진입 시 누락 쿼리를 채울 기본값. */
export interface DevLoginDefaults {
  /** dev 모드 여부. false면 절대 보정하지 않습니다(운영 안전장치). */
  isDev: boolean;
  clientId: string;
  clientType: string;
}

/** 쿼리 키 ↔ 기본값 키 매핑. (쿼리는 kebab, 기본값은 camel) */
const FILL_KEYS = [
  ["client-id", "clientId"],
  ["client-type", "clientType"],
] as const;

/**
 * @description 누락된 로그인 쿼리를 개발용 기본값으로 채운 새 `URLSearchParams`를 반환합니다.
 *
 * 다음 경우엔 `null`을 반환해(= 보정 불필요) 리다이렉트를 일으키지 않습니다.
 * - 운영 빌드(`isDev=false`)
 * - 채울 값이 없는 경우(기본값이 빈 키는 건너뜀 → 무한 리다이렉트 방지)
 * - 이미 모든 키가 채워진 경우
 *
 * @param params - 현재 쿼리스트링
 * @param defaults - 개발용 기본값
 * @returns 보정된 새 파라미터, 또는 보정이 필요 없으면 `null`
 */
export function resolveDevLoginParams(
  params: URLSearchParams,
  defaults: DevLoginDefaults,
): URLSearchParams | null {
  if (!defaults.isDev) return null;

  const next = new URLSearchParams(params);
  let changed = false;

  for (const [queryKey, defaultKey] of FILL_KEYS) {
    const value = defaults[defaultKey];
    if (value && !next.get(queryKey)) {
      next.set(queryKey, value);
      changed = true;
    }
  }

  return changed ? next : null;
}
