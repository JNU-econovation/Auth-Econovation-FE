import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/**
 * SSO 백엔드 공통 axios 인스턴스.
 * 명세상 모든 인증 요청에 `credentials: 'include'`(쿠키 자동 전송)가 필수이므로
 * 인스턴스 레벨에서 withCredentials를 활성화합니다.
 *
 * `Client-Type: WEB` 기본 헤더로 백엔드가 토큰을 HttpOnly 쿠키로 발급/관리하도록 지시합니다
 * (web·console 모두 브라우저 클라이언트 = WEB). 모킹 핸들러도 이 헤더로 WEB/APP 분기를 판정합니다.
 */
export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Client-Type": "WEB" },
});
