import { describe, it, expect } from "vitest";
import { getFieldErrorFromCode } from "@pages/sign-up/SignUpFormSection/errorCodeMap";

describe("getFieldErrorFromCode", () => {
  it("4100: 이름 유효성 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4100, "서버 메시지");
    expect(result).toEqual({
      field: "name",
      message: "이름이 유효하지 않습니다.",
    });
  });

  it("4101: 아이디 유효성 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4101, "서버 메시지");
    expect(result).toEqual({
      field: "id",
      message: "아이디가 유효하지 않습니다.",
    });
  });

  it("4102: 아이디 중복 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4102, "서버 메시지");
    expect(result).toEqual({
      field: "id",
      message: "이미 사용 중인 아이디입니다.",
    });
  });

  it("4103: 비밀번호 유효성 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4103, "서버 메시지");
    expect(result).toEqual({
      field: "password",
      message: "비밀번호가 유효하지 않습니다.",
    });
  });

  it("4104: 기수 유효성 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4104, "서버 메시지");
    expect(result).toEqual({
      field: "generation",
      message: "기수가 유효하지 않습니다.",
    });
  });

  it("4105: 이름 필수 항목 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4105, "서버 메시지");
    expect(result).toEqual({
      field: "name",
      message: "이름은 필수 항목입니다.",
    });
  });

  it("4106: 아이디 필수 항목 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4106, "서버 메시지");
    expect(result).toEqual({
      field: "id",
      message: "아이디는 필수 항목입니다.",
    });
  });

  it("4107: 비밀번호 필수 항목 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4107, "서버 메시지");
    expect(result).toEqual({
      field: "password",
      message: "비밀번호는 필수 항목입니다.",
    });
  });

  it("4108: 기수 필수 항목 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4108, "서버 메시지");
    expect(result).toEqual({
      field: "generation",
      message: "기수는 필수 항목입니다.",
    });
  });

  it("4109: 활동 상태 필수 항목 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4109, "서버 메시지");
    expect(result).toEqual({
      field: "activeStatus",
      message: "활동 상태는 필수 항목입니다.",
    });
  });

  it("4009: 이미 존재하는 계정 에러를 반환한다", () => {
    const result = getFieldErrorFromCode(4009, "서버 메시지");
    expect(result).toEqual({
      field: "id",
      message: "이미 존재하는 계정입니다.",
    });
  });

  it("3001: message가 null이므로 serverMessage를 사용한다", () => {
    const result = getFieldErrorFromCode(3001, "서버에서 전달된 메시지");
    expect(result).toEqual({
      field: "activeStatus",
      message: "서버에서 전달된 메시지",
    });
  });

  it("알 수 없는 에러 코드는 null을 반환한다", () => {
    expect(getFieldErrorFromCode(9999, "서버 메시지")).toBeNull();
  });

  it("0 코드는 매핑에 없으므로 null을 반환한다", () => {
    expect(getFieldErrorFromCode(0, "서버 메시지")).toBeNull();
  });
});
