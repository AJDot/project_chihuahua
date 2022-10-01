import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.IS_DEV !== 'true' ? './' : '/',
  build: {
    outDir: 'app/build',
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    }
  }
})
