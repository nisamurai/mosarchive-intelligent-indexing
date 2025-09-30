# Multi-stage build для React приложения
# Используем Node.js 18 Alpine для меньшего размера образа
FROM node:18-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json bun.lock* ./

# Устанавливаем bun для быстрой установки зависимостей
RUN npm install -g bun

# Стадия установки зависимостей
FROM base AS deps
# Устанавливаем зависимости (используем bun для скорости)
RUN bun install --frozen-lockfile

# Стадия сборки
FROM base AS builder
# Копируем зависимости из предыдущей стадии
COPY --from=deps /app/node_modules ./node_modules
# Копируем исходный код
COPY . .

# Собираем приложение для продакшена
RUN bun run build

# Стадия продакшена с nginx
FROM nginx:alpine AS production

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 3000
EXPOSE 3000

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
