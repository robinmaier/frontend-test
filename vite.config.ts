import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl({
    certDir: './certs'
  })],
  server: {
      proxy: {
          '/api': {
              target: 'http://127.0.0.1:5000',
              changeOrigin: true,
              xfwd: true,
              rewrite: (path) => path.replace(/^\/api/, '')
          }
      }
  }
})
