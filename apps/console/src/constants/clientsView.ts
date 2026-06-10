/**
 * 클라이언트 목록 화면 표시 모드.
 *
 * - `"table"`: 목록 조회 API 기반 정식 테이블(현재 MSW mock으로 동작)
 * - `"lookup"`: clientId 단건 조회 임시 뷰(백엔드 목록 API 미확정 시 대안)
 *
 * 백엔드 목록 엔드포인트 확정 여부에 따라 이 상수만 바꿔 두 화면을 갈아끼웁니다.
 * (두 화면 모두 구현되어 있으므로 값 변경만으로 전환됩니다.)
 */
export type ClientsListMode = "table" | "lookup";

export const CLIENTS_LIST_MODE: ClientsListMode = "table";
