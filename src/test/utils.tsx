import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

/**
 * 테스트 전용 QueryClient를 생성합니다.
 * `retry: false`로 실패 시 재시도를 끄고, gcTime을 0으로 둬 테스트 간 캐시 누수를 방지합니다.
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /** 초기 라우터 경로(쿼리스트링 포함). 예: "/?redirect-url=https://app.econovation.kr" */
  route?: string;
  /** 외부에서 QueryClient를 주입하고 싶을 때 사용(캐시 상태 검증 등). */
  queryClient?: QueryClient;
}

/**
 * @public
 * @description 컴포넌트를 SSO 앱의 실제 Provider 구성(QueryClient + Router)으로 감싸 렌더링합니다.
 * 통합 테스트에서 `main.tsx`의 Provider 트리를 그대로 재현하기 위한 헬퍼입니다.
 * @example
 * const { user } = renderWithProviders(<LoginFormSection />, {
 *   route: "/?redirect-url=https://app.econovation.kr",
 * });
 * await user.type(screen.getByLabelText("id"), "hong123");
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = "/", queryClient, ...renderOptions }: RenderWithProvidersOptions = {},
) => {
  const client = queryClient ?? createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  return {
    user: userEvent.setup(),
    queryClient: client,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// RTL의 screen, waitFor 등을 한 곳에서 재노출해 import 경로를 단순화합니다.
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
