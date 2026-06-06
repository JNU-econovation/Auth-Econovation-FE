import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'

/**
 * `VITE_ENABLE_MSW=true`일 때만 MSW 브라우저 워커를 시작합니다.
 * 실제 백엔드 없이 SSO 화면을 구동/시연하기 위한 개발 전용 모킹 경로이며,
 * 프로덕션 빌드에서는 플래그가 꺼져 있어 워커가 동작하지 않습니다.
 */
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return
  const { worker } = await import('./test/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
})
