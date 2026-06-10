import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { ToastProvider } from "@auth-econovation/ui";

/**
 * 테스트 전용 QueryClient. `retry: false` + `gcTime: 0`으로 재시도/캐시 누수를 차단합니다.
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /** 초기 라우터 경로. */
  route?: string;
  /** 외부 QueryClient 주입(캐시 검증 등). */
  queryClient?: QueryClient;
}

/**
 * @public
 * @description 콘솔 앱의 Provider 구성(QueryClient + Router)으로 감싸 렌더링합니다.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = "/", queryClient, ...renderOptions }: RenderWithProvidersOptions = {},
) => {
  const client = queryClient ?? createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{children}</ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    user: userEvent.setup(),
    queryClient: client,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
