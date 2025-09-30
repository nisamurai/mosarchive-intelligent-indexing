import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: './.vite', // Кэш внутри проекта
  server: {
    port: 5173, // Фиксированный порт для разработки
    host: true, // Доступ с других устройств в сети
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173, // Порт для preview режима
    host: true,
  },
})
