import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // 빌드/생성 산출물은 린트 대상에서 제외(MSW 워커, VitePress 캐시는 생성 파일).
  // 모노레포 전 워크스페이스에 적용되도록 글롭으로 지정합니다.
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/public/mockServiceWorker.js',
      'apps/docs/.vitepress/cache',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
