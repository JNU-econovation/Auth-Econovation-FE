/**
 * 환경변수 검증 순수 함수.
 *
 * `import.meta.env` 접근(부팅 시점 평가)과 분리해 두어, node(unit) 환경에서
 * Vite 런타임 없이도 검증 규칙 자체를 단위 테스트할 수 있게 합니다.
 * 실제 값 바인딩은 `src/env.ts`가 담당합니다.
 */

/**
 * @public
 * @description 필수 환경변수를 검증합니다. 값이 없거나 공백뿐이면 명확한 에러로 즉시 실패시킵니다.
 * @param value - `import.meta.env`에서 읽은 원시 값
 * @param name - 변수명(에러 메시지에 노출)
 * @returns 공백이 아닌 문자열로 좁혀진 값
 * @throws 값이 `undefined`/빈 문자열/공백뿐이면 `Error`
 */
export function requireEnv(value: string | undefined, name: string): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(`[env] ${name} is not defined`);
  }
  return value;
}

/**
 * @public
 * @description 불리언 플래그 환경변수를 파싱합니다. 정확히 문자열 `"true"`일 때만 `true`입니다.
 * @param value - `import.meta.env`에서 읽은 원시 값
 * @returns 플래그 활성화 여부
 */
export function parseBoolEnv(value: string | undefined): boolean {
  return value === "true";
}
