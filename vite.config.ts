import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 本地开发时，将 /api/chat 请求代理到 Dify API
      '/api/chat': {
        target: 'http://150.158.57.162:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1'),
        headers: {
          'Authorization': 'Bearer app-oYVKHjo6fnc6CNOjUwD6uYqc',
        },
      },
    },
  },
})
