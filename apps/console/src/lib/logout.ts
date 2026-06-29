import { logoutApi } from "@auth-econovation/api";
import { clearStoredTokens } from "@/lib/redirectTokens";
import { redirectToLogin } from "@/lib/redirectToLogin";

/**
 * @description 콘솔 로그아웃: 서버 로그아웃 호출 → 보관 토큰 삭제 → SSO 로그인으로 이동.
 *
 * 콘솔은 토큰을 localStorage로 받는 APP 흐름이라, 서버의 `logoutApi("APP")`는 멱등하게
 * 200만 반환할 뿐 보관 토큰을 만료시키지 않습니다. 따라서 호출 측이 `clearStoredTokens`로
 * AT/RT를 직접 지운 뒤, 자체 로그인 폼이 없는 콘솔 특성상 `redirectToLogin`으로 SSO
 * 로그인 페이지로 전체 페이지 이동합니다.
 *
 * 서버 호출이 실패하더라도(네트워크 등) 로컬 토큰 삭제와 로그인 이동은 보장합니다 —
 * 사용자 관점에서 로그아웃은 항상 완료되어야 하기 때문입니다.
 */
export const logout = async (): Promise<void> => {
  try {
    await logoutApi("APP");
  } finally {
    clearStoredTokens();
    redirectToLogin();
  }
};
