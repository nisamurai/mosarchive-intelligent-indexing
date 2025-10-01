#!/bin/bash

echo "=== Настройка публичного доступа к MosArchive ==="
echo

# 1. Обновление конфигурации Nginx
echo "1. Обновление конфигурации Nginx..."
sudo cp nginx-mosarchive.conf /etc/nginx/sites-available/mosarchive-intelligent-indexing

# Проверка конфигурации
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "   [OK] Конфигурация Nginx корректна"
else
    echo "   [ERROR] Ошибка в конфигурации Nginx"
    exit 1
fi

# Перезагрузка Nginx
sudo systemctl reload nginx
echo "   [OK] Nginx перезагружен"

echo

# 2. Настройка файрвола
echo "2. Настройка файрвола..."
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 5174/tcp
sudo ufw allow 5175/tcp

echo "   [OK] Правила файрвола добавлены"

echo

# 3. Перезапуск Docker контейнеров
echo "3. Перезапуск Docker контейнеров..."
docker-compose down
docker-compose build
docker-compose up -d

echo "   [OK] Docker контейнеры перезапущены"

echo

# 4. Проверка статуса сервисов
echo "4. Проверка статуса сервисов..."

# Проверка Nginx
if systemctl is-active --quiet nginx; then
    echo "   [OK] Nginx работает"
else
    echo "   [ERROR] Nginx не работает"
fi

# Проверка Docker контейнеров
if docker-compose ps | grep -q "Up"; then
    echo "   [OK] Docker контейнеры работают"
    docker-compose ps
else
    echo "   [ERROR] Docker контейнеры не работают"
fi

echo

# 5. Проверка доступности
echo "5. Проверка доступности..."

# Проверка backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   [OK] Backend доступен на localhost:8000"
else
    echo "   [ERROR] Backend недоступен на localhost:8000"
fi

# Проверка frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "   [OK] Frontend доступен на localhost:3000"
else
    echo "   [ERROR] Frontend недоступен на localhost:3000"
fi

# Проверка Nginx
if curl -s http://localhost:80 > /dev/null; then
    echo "   [OK] Nginx доступен на localhost:80"
else
    echo "   [ERROR] Nginx недоступен на localhost:80"
fi

echo

# 6. Информация о доступе
echo "6. Информация о доступе:"
echo "   Публичный IP: 85.159.231.195"
echo "   Frontend (через Nginx): http://85.159.231.195"
echo "   Backend API: http://85.159.231.195:8000"
echo "   Backend Health: http://85.159.231.195:8000/health"
echo "   API Docs: http://85.159.231.195:8000/docs"

echo

# 7. Проверка публичного доступа
echo "7. Проверка публичного доступа..."

# Проверка backend через публичный IP
if curl -s http://85.159.231.195:8000/health > /dev/null; then
    echo "   [OK] Backend доступен через публичный IP"
else
    echo "   [WARNING] Backend недоступен через публичный IP (возможно, файрвол)"
fi

# Проверка Nginx через публичный IP
if curl -s http://85.159.231.195 > /dev/null; then
    echo "   [OK] Nginx доступен через публичный IP"
else
    echo "   [WARNING] Nginx недоступен через публичный IP (возможно, файрвол)"
fi

echo
echo "=== Настройка завершена ==="
echo
echo "Для доступа к сервису используйте:"
echo "  http://85.159.231.195"
echo
echo "Для проверки логов:"
echo "  docker-compose logs -f"
echo "  sudo journalctl -u nginx -f"
