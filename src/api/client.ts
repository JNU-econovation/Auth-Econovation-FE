import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/**
 * SSO 백엔드 공통 axios 인스턴스.
 * 명세상 모든 인증 요청에 `credentials: 'include'`(쿠키 자동 전송)가 필수이므로
 * 인스턴스 레벨에서 withCredentials를 활성화합니다.
 */
export const apiClient = axios.create({ baseURL, withCredentials: true });
