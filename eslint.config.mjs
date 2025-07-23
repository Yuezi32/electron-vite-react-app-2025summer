import eslint from '@electron-toolkit/eslint-config'
// import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  eslint,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      // 设置未使用变量的检查规则
      'no-unused-vars': ['warn', { vars: 'all', args: 'none', ignoreRestSiblings: false }],
      // 取消对react prop传参的检查
      'react/prop-types': 'off',
      // 取消对自定义HTML属性的检查 react/no-unknown-property
      'react/no-unknown-property': 'off',
      // 降级对target="_blank" without rel="noreferrer"的警告
      'react/jsx-no-target-blank': 'warn'
    }
  }
  // eslintConfigPrettier
]
