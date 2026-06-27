import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/**
 * SSO 백엔드 공통 axios 인스턴스.
 * 명세상 모든 인증 요청에 `credentials: 'include'`(쿠키 자동 전송)가 필수이므로
 * 인스턴스 레벨에서 withCredentials를 활성화합니다.
 *
 * `Client-Type: WEB` 기본 헤더로 백엔드가 토큰을 HttpOnly 쿠키로 발급/관리하도록 지시합니다.
 * 모킹 핸들러도 이 헤더로 WEB/APP 분기를 판정합니다.
 *
 * 인증 전달 방식은 앱마다 다릅니다:
 * - **web**: AT/RT를 HttpOnly 쿠키로 받으므로 `withCredentials`만으로 충분합니다(토큰 게터 미주입).
 *   기본 헤더 `Client-Type: WEB`를 그대로 실어 쿠키 기반 인증 흐름을 사용합니다.
 * - **console**: AT를 localStorage로 받는 토큰 기반이라, 진입 시 `setAuthTokenGetter`로 토큰 게터를
 *   주입해 매 요청에 `Authorization: Bearer <AT>`를 싣습니다(아래 요청 인터셉터). 토큰 기반이라
 *   WEB/APP 쿠키 분기가 무의미하므로 `Client-Type: WEB` 기본 헤더는 요청 인터셉터에서 제거합니다.
 */
export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Client-Type": "WEB" },
});

/**
 * Authorization 헤더에 실을 액세스 토큰을 제공하는 게터.
 * 미주입(web 기본)이면 토큰을 붙이지 않아 기존 쿠키 인증을 그대로 사용합니다.
 */
let accessTokenGetter: (() => string | null | undefined) | null = null;

/**
 * @public
 * @category Auth
 * @description Authorization 헤더용 액세스 토큰 게터를 등록/해제합니다.
 *
 * 공유 `apiClient`를 web(쿠키)·console(토큰)이 함께 쓰므로, 토큰 출처(localStorage 등)를
 * 패키지가 직접 알지 않고 앱이 주입합니다. 게터를 등록한 앱(console)만 매 요청에
 * `Authorization: Bearer <token>`이 붙고, 미등록 앱(web)은 영향이 없습니다.
 *
 * @param getter - 액세스 토큰(없으면 null/undefined)을 반환하는 함수. `null`을 넘기면 해제.
 * @example
 * // 콘솔 진입점에서 localStorage 게터를 1회 등록
 * setAuthTokenGetter(getStoredAccessToken);
 */
export const setAuthTokenGetter = (
  getter: (() => string | null | undefined) | null,
): void => {
  accessTokenGetter = getter;
};

/**
 * 요청 인터셉터(토큰 게터를 등록한 앱 = console 전용 처리):
 * - 게터가 토큰을 반환하면 `Authorization: Bearer <token>`을 주입합니다.
 * - 토큰 기반이라 WEB 쿠키 분기가 무의미하므로 기본 헤더 `Client-Type: WEB`를 제거합니다.
 *
 * 게터 미주입(web)이면 두 처리 모두 건너뛰어 기본 헤더(`Client-Type: WEB`)와
 * 쿠키 인증을 그대로 유지합니다.
 *
 * 재발급(reissue)은 수행하지 않습니다 — AT 만료로 인한 401/403은 호출 측(콘솔의 queryClient
 * 전역 에러 핸들러)이 로그인 필요로 보고 SSO 로그인으로 리다이렉트합니다.
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!accessTokenGetter) return config;

  const token = accessTokenGetter();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  // console(토큰 기반) 요청에는 web 전용 `Client-Type: WEB` 헤더를 싣지 않습니다.
  config.headers.delete("Client-Type");
  return config;
});
