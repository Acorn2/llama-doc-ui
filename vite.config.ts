import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          axios: [
            ['default', 'axios']
          ]
        }
      ],
      dts: true,
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/views': resolve(__dirname, 'src/views'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/api': resolve(__dirname, 'src/api'),
      '@/store': resolve(__dirname, 'src/store'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/styles': resolve(__dirname, 'src/styles')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库打包到一个 chunk
          vue: ['vue', 'vue-router', 'pinia'],
          // 将 Element Plus 相关库打包到一个 chunk
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          // 将图表库打包到一个 chunk
          charts: ['chart.js', 'vue-chartjs'],
          // 将工具库打包到一个 chunk
          utils: ['axios', 'dayjs', 'lodash-es'],
          // Socket.io
          socket: ['socket.io-client']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? []
          let extType = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name ?? '')) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name ?? '')) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name ?? '')) {
            extType = 'fonts'
          }
          return `${extType}/[name]-[hash].[ext]`
        }
      }
    },
    // 设置包大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'element-plus/es',
      'element-plus/es/components/button/style/css',
      'element-plus/es/components/input/style/css',
      'element-plus/es/components/upload/style/css',
      'element-plus/es/components/message/style/css',
      'element-plus/es/components/notification/style/css',
      'chart.js',
      'dayjs',
      'lodash-es'
    ]
  }
}) 