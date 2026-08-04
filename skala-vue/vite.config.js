import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 프로젝트 페이지(https://<user>.github.io/skala-vue/)로 배포하므로
  // 정적 자산 경로가 저장소 이름 하위 경로를 기준으로 계산되도록 base를 지정한다.
  base: '/skala-vue/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
