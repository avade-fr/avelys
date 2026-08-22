import js from '@eslint/js'
import eslintConfigTypeScript from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...eslintConfigTypeScript(),
  {
    rules: {
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
]
