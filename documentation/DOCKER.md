# Docker-инфраструктура

Инструкции по сборке и запуску проекта в Docker-контейнерах для офлайн-развёртывания.

## Архитектура проекта

Проект разделен на два основных сервиса:

- **Frontend** (React + Vite + TypeScript) - порт 3000
- **Backend** (Python FastAPI) - порт 8000

## Структура проекта

```
mosarchive-intelligent-indexing/
├── frontend/                 # React приложение
│   ├── Dockerfile           # Dockerfile для фронтенда
│   ├── nginx.conf           # Конфигурация Nginx
│   ├── .dockerignore        # Исключения для Docker
│   └── src/                 # Исходный код React
├── backend/                 # Python бэкенд
│   ├── Dockerfile           # Dockerfile для бэкенда
│   ├── .dockerignore        # Исключения для Docker
│   ├── requirements.txt     # Python зависимости
│   └── *.py                 # Исходный код Python
├── docker-compose.yml       # Конфигурация всех сервисов
└── README_DOCKER.md         # Этот файл
```

## Требования

- Docker 20.10+
- Docker Compose 2.0+

## Быстрый запуск

### 1. Сборка и запуск всех сервисов

```bash
# Сборка всех образов
docker-compose build

# Запуск всех сервисов
docker-compose up
```

### 2. Проверка работы

После запуска сервисы будут доступны по адресам:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Health Check**: http://localhost:8000/health

## Детальные инструкции

### Сборка образов

```bash
# Сборка всех сервисов
docker-compose build

# Сборка только фронтенда
docker-compose build frontend

# Сборка только бэкенда
docker-compose build backend
```

### Запуск сервисов

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Запуск с выводом логов
docker-compose up

# Запуск только фронтенда
docker-compose up frontend

# Запуск только бэкенда
docker-compose up backend
```

### Просмотр логов

```bash
# Логи всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs frontend
docker-compose logs backend

# Следить за логами в реальном времени
docker-compose logs -f
```

### Остановка сервисов

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Остановка с удалением образов
docker-compose down --rmi all
```

## Конфигурация

### Переменные окружения

Основные переменные окружения для бэкенда:

- `PYTHONPATH=/app` - путь к Python модулям
- `PYTHONUNBUFFERED=1` - отключение буферизации вывода

### Volumes (тома данных)

Следующие директории монтируются как volumes для сохранения данных:

- `./backend/uploads` - загруженные файлы
- `./backend/processed` - обработанные файлы
- `./backend/ocr_results` - результаты OCR
- `./backend/attribute_results` - результаты распознавания атрибутов
- `./backend/reports` - сгенерированные отчеты
- `./backend/logs` - логи приложения

## Health Checks

Оба сервиса имеют настроенные health checks:

- **Backend**: проверка доступности `/health` endpoint
- **Frontend**: проверка доступности главной страницы

## Офлайн-режим

Все контейнеры работают в офлайн-режиме:

- Используются локальные копии всех зависимостей
- Нет необходимости в интернет-соединении после сборки
- Все библиотеки включены в Docker-образы

## Устранение неполадок

### Проблемы с портами

Если порты 3000 или 8000 заняты, измените их в `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Изменить на свободный порт
  backend:
    ports:
      - "8001:8000"  # Изменить на свободный порт
```

### Проблемы с правами доступа

На Linux/macOS может потребоваться изменить права доступа:

```bash
sudo chown -R $USER:$USER ./backend/uploads
sudo chown -R $USER:$USER ./backend/processed
```

### Очистка Docker

```bash
# Удаление всех неиспользуемых образов
docker system prune -a

# Удаление всех volumes
docker volume prune

# Полная очистка
docker system prune -a --volumes
```

## Примеры использования

### Разработка

```bash
# Запуск с пересборкой при изменениях
docker-compose up --build

# Запуск только бэкенда для разработки
docker-compose up backend
```

### Продакшн

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

## Мониторинг

### Проверка статуса сервисов

```bash
# Статус всех контейнеров
docker-compose ps

# Детальная информация
docker-compose top
```

### Использование ресурсов

```bash
# Использование ресурсов контейнерами
docker stats
```

## Безопасность

- Все контейнеры работают в изолированной сети
- Используются минимальные базовые образы (Alpine)
- Нет root-доступа в контейнерах
- Настроены security headers в Nginx

## Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что порты свободны
3. Проверьте доступность Docker и Docker Compose
4. Очистите кэш: `docker-compose build --no-cache`
