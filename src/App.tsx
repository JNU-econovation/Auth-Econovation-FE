import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* Tailwind CSS 테스트 */}
      <div className="bg-blue-500 text-white p-4 rounded-lg mt-4">
        Tailwind is working! 🎉
      </div>

      {/* Pretendard 폰트 굵기 테스트 */}
      <div className="space-y-2 mt-4">
        <p className="font-thin">Pretendard Thin (100) - 한글 테스트</p>
        <p className="font-light">Pretendard Light (300) - 한글 테스트</p>
        <p className="font-normal">Pretendard Regular (400) - 한글 테스트</p>
        <p className="font-medium">Pretendard Medium (500) - 한글 테스트</p>
        <p className="font-semibold">Pretendard SemiBold (600) - 한글 테스트</p>
        <p className="font-bold">Pretendard Bold (700) - 한글 테스트</p>
        <p className="font-extrabold">Pretendard ExtraBold (800) - 한글 테스트</p>
        <p className="font-black">Pretendard Black (900) - 한글 테스트</p>
      </div>
    </>
  )
}

export default App
