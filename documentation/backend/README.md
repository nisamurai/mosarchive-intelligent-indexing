# MOS Archive Intelligent Indexing Backend

Backend API для системы интеллектуального индексирования архивных документов на основе FastAPI.

## Структура проекта

```
backend/
├── main.py              # Главный файл приложения
├── upload.py            # Модуль загрузки файлов
├── preprocess.py        # Модуль предобработки изображений
├── ocr.py              # Модуль распознавания текста
├── attributes.py       # Модуль извлечения атрибутов
├── report.py           # Модуль генерации отчётов
├── stats.py            # Модуль статистики
└── README.md           # Документация
```

## Установка и запуск

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Запуск сервера

```bash
# Запуск в режиме разработки
python backend/main.py

# Или через uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Доступ к API

- **API**: http://localhost:8000
- **Документация**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Проверка состояния**: http://localhost:8000/health

## Модули API

### 1. Upload Module (`/upload`)

Загрузка и управление файлами документов.

**Endpoints:**
- `POST /upload/file` - Загрузка одного файла
- `POST /upload/files` - Загрузка нескольких файлов
- `GET /upload/files` - Список загруженных файлов
- `DELETE /upload/file/{file_id}` - Удаление файла

**Пример:**
```bash
curl -X POST "http://localhost:8000/upload/file" \
     -H "Authorization: Bearer <token>" \
     -F "file=@document.pdf"
```

### 2. Preprocess Module (`/preprocess`)

Предобработка изображений для улучшения качества распознавания.

**Endpoints:**
- `GET /preprocess/steps` - Список этапов обработки
- `POST /preprocess/process` - Полная обработка изображения
- `POST /preprocess/step/{step_name}` - Выполнение одного этапа
- `GET /preprocess/status/{file_id}` - Статус обработки

**Пример:**
```bash
curl -X POST "http://localhost:8000/preprocess/process" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"file_id": "uuid", "steps": ["correct_perspective", "enhance_contrast"]}'
```

### 3. OCR Module (`/ocr`)

Распознавание текста на изображениях документов.

**Endpoints:**
- `GET /ocr/languages` - Поддерживаемые языки
- `GET /ocr/model-types` - Типы моделей OCR
- `POST /ocr/recognize` - Распознавание текста
- `GET /ocr/result/{file_id}` - Результат распознавания

**Пример:**
```bash
curl -X POST "http://localhost:8000/ocr/recognize" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"file_id": "uuid", "language": "ru", "model_type": "printed"}'
```

### 4. Attributes Module (`/attributes`)

Извлечение структурированных атрибутов из распознанного текста.

**Endpoints:**
- `GET /attributes/types` - Типы атрибутов
- `POST /attributes/extract` - Извлечение атрибутов
- `GET /attributes/result/{file_id}` - Результат извлечения
- `POST /attributes/validate` - Валидация атрибутов

**Пример:**
```bash
curl -X POST "http://localhost:8000/attributes/extract" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"file_id": "uuid", "validation_enabled": true}'
```

### 5. Report Module (`/report`)

Генерация отчётов по обработанным документам.

**Endpoints:**
- `GET /report/types` - Типы отчётов
- `GET /report/formats` - Форматы отчётов
- `POST /report/generate` - Генерация отчёта
- `GET /report/download/{report_id}` - Скачивание отчёта

**Пример:**
```bash
curl -X POST "http://localhost:8000/report/generate" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"file_ids": ["uuid1", "uuid2"], "report_type": "standard", "format": "json"}'
```

### 6. Stats Module (`/stats`)

Статистика по работе системы и обработке документов.

**Endpoints:**
- `GET /stats/overview` - Общая статистика
- `GET /stats/files` - Статистика файлов
- `GET /stats/processing` - Статистика обработки
- `GET /stats/ocr` - Статистика OCR

**Пример:**
```bash
curl -X GET "http://localhost:8000/stats/overview" \
     -H "Authorization: Bearer <token>"
```

### 7. Auth Module (`/auth`)

Авторизация и аутентификация пользователей.

**Endpoints:**
- `POST /register` - Регистрация пользователя
- `POST /login` - Авторизация
- `GET /me` - Информация о пользователе
- `POST /logout` - Выход из системы

**Пример:**
```bash
curl -X POST "http://localhost:8000/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
```

## Аутентификация

API использует JWT токены для аутентификации. Для доступа к защищенным endpoints необходимо:

1. Получить токен через `/login`
2. Передавать токен в заголовке `Authorization: Bearer <token>`

## CORS

API настроен для работы с фронтендом на следующих адресах:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (React dev server)

## Логирование

Все запросы логируются в файл `backend.log` и выводятся в консоль.

## Обработка ошибок

API возвращает стандартные HTTP коды:
- `200` - Успешный запрос
- `400` - Ошибка валидации
- `401` - Неавторизованный доступ
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Разработка

### Структура модуля

Каждый модуль содержит:
- Роутер с префиксом (`/upload`, `/preprocess`, etc.)
- Модели данных (Pydantic)
- Обработчики endpoints
- Валидацию входных данных
- Логирование
- Обработку ошибок

### Добавление нового модуля

1. Создать файл `new_module.py`
2. Определить роутер с префиксом
3. Добавить модели данных
4. Реализовать endpoints
5. Подключить роутер в `main.py`

### Тестирование

```bash
# Запуск тестов
pytest

# Запуск с покрытием
pytest --cov=backend
```

## Конфигурация

Основные настройки в `main.py`:
- CORS origins
- JWT секретный ключ
- Директории для файлов
- Логирование

## Безопасность

- JWT токены для аутентификации
- Валидация входных данных
- Ограничения на размер файлов
- Проверка типов файлов
- Логирование всех запросов

## Мониторинг

- Health check endpoint (`/health`)
- Статистика производительности (`/stats/performance`)
- Логирование запросов
- Обработка ошибок

## Развертывание

### Production

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск с Gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Поддержка

Для вопросов и поддержки обращайтесь к команде разработки MosArchive Intelligent Indexing
