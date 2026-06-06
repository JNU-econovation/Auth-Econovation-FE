import { describe, it, expect } from "vitest";
import { getFieldErrorFromCode } from "@pages/sign-up/SignUpFormSection/errorCodeMap";

/**
 * 회원가입 errorCodeMap 단위 테스트.
 *
 * SSO 백엔드 명세(`context/sso-api/frontend-auth.md`, `common.md`)의 문자열 errorCode를
 * 기준으로 검증합니다. 명세상 회원가입 실패 코드는 MEMBER_ALREADY_EXISTS /
 * INVALID_PASSWORD_POLICY / VALIDATION_FAILED 3가지뿐입니다.
 */
describe("getFieldErrorFromCode", () => {
  it("MEMBER_ALREADY_EXISTS: 아이디 중복 에러를 id 필드로 매핑한다", () => {
    const result = getFieldErrorFromCode("MEMBER_ALREADY_EXISTS", "서버 메시지");
    expect(result).toEqual({
      field: "id",
      message: "이미 사용 중인 아이디입니다.",
    });
  });

  it("INVALID_PASSWORD_POLICY: 비밀번호 정책 위반을 password 필드로 매핑한다", () => {
    const result = getFieldErrorFromCode(
      "INVALID_PASSWORD_POLICY",
      "서버 메시지",
    );
    expect(result).toEqual({
      field: "password",
      message: "비밀번호 정책을 위반했습니다.",
    });
  });

  it("VALIDATION_FAILED: 특정 필드로 매핑되지 않으므로 null을 반환한다", () => {
    expect(getFieldErrorFromCode("VALIDATION_FAILED", "서버 메시지")).toBeNull();
  });

  it("알 수 없는 에러 코드는 null을 반환한다", () => {
    expect(getFieldErrorFromCode("UNKNOWN_CODE", "서버 메시지")).toBeNull();
  });

  it("빈 문자열 코드는 매핑에 없으므로 null을 반환한다", () => {
    expect(getFieldErrorFromCode("", "서버 메시지")).toBeNull();
  });
});
