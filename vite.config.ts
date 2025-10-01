import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Убираем автоматические импорты, так как они конфликтуют с существующими
        // additionalData: `@import "./src/styles/_colors.scss"; @import "./src/styles/_sizes.scss"; @import "./src/styles/_typography.scss"; @import "./src/styles/_utilities.scss"; @import "./src/styles/_animations.scss";`
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://77.222.58.224:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  base: './',
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
