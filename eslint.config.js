import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettierConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: {
          ts: typescriptParser,
        },
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        
        // Vue globals
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        
        // Auto-import globals
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        
        // Router globals
        useRouter: 'readonly',
        useRoute: 'readonly',
        
        // Pinia globals
        defineStore: 'readonly',
        storeToRefs: 'readonly',
        
        // Element Plus globals
        ElMessage: 'readonly',
        ElNotification: 'readonly',
        ElMessageBox: 'readonly',
        ElLoading: 'readonly',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Vue rules
      'vue/multi-word-component-names': 'off',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'error',
      'vue/no-v-html': 'warn',
      'vue/no-unused-components': 'error',
      'vue/no-unused-vars': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/component-tags-order': ['error', {
        order: ['script', 'template', 'style']
      }],
      
      // JavaScript rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'object-shorthand': 'error',
      'quote-props': ['error', 'as-needed'],
      'no-unneeded-ternary': 'error',
      'no-useless-return': 'error',
      'no-useless-concat': 'error',
      'no-duplicate-imports': 'error',
      
      // Prettier rules
      'prettier/prettier': ['error', {
        semi: false,
        singleQuote: true,
        quoteProps: 'as-needed',
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
        tabWidth: 2,
        useTabs: false,
        printWidth: 100,
      }],
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      // Vue specific overrides
      'vue/max-attributes-per-line': ['error', {
        singleline: { max: 3 },
        multiline: { max: 1 },
      }],
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      }],
    },
  },
  {
    files: ['**/*.config.{js,ts}', '**/vite.config.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      '.vscode/**',
      '.idea/**',
      '*.min.js',
      'auto-imports.d.ts',
      'components.d.ts',
    ],
  },
] 