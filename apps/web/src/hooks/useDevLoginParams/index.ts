import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { env } from "@/env";
import { resolveDevLoginParams } from "./resolveDevLoginParams";

/** `.env`에서 바인딩한 개발용 로그인 쿼리 기본값. */
const devDefaults = {
  isDev: env.isDev,
  clientId: env.devClientId,
  clientType: env.devClientType,
};

/**
 * @description 개발 모드에서 '/'로 바로 진입해 로그인에 필요한 쿼리
 * (`client-id`/`client-type`)가 비어 있으면, `.env`의 개발용 기본값으로 채워
 * 같은 경로로 1회 `replace` 리다이렉트합니다.
 *
 * 운영 빌드(`import.meta.env.DEV=false`)나 이미 쿼리가 채워진 경우엔 아무 동작도 하지 않습니다.
 * 기본값이 빈 키는 건너뛰므로(채울 값이 없으면 변경 없음) 무한 리다이렉트가 발생하지 않습니다.
 *
 * @returns `redirecting` - 보정 리다이렉트가 진행 중인지 여부. true면 화면 렌더를 잠시 보류합니다.
 */
export function useDevLoginParams(): { redirecting: boolean } {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const next = resolveDevLoginParams(searchParams, devDefaults);
    if (next) {
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return {
    redirecting: resolveDevLoginParams(searchParams, devDefaults) !== null,
  };
}
