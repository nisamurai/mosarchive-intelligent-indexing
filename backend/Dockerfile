# Используем Python 3.11 slim образ для меньшего размера
FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем Python зависимости
# Используем --no-cache-dir для уменьшения размера образа
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код приложения
COPY . .

# Создаем необходимые директории
RUN mkdir -p logs uploads processed ocr_results attribute_results reports

# Устанавливаем переменные окружения
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Открываем порт 8000
EXPOSE 8000

# Команда запуска приложения
# Используем uvicorn для запуска FastAPI приложения
CMD ["python", "main.py"]
