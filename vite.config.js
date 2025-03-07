import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    mode === 'development' && vueDevTools(), // 仅在开发模式启用
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://nav.tum.de', // 目标 API 服务器
        changeOrigin: true, // 更改源以匹配目标
        secure: false, // 如果目标使用自签名证书，可以设置为 false
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 保留 /api 前缀
      },
    },
  },
}))
