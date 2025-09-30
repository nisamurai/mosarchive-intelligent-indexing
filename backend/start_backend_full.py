#!/usr/bin/env python3
"""
Скрипт для запуска полного backend API сервера
Включает все модули: загрузка, предобработка, OCR, атрибуты, отчёты, статистика, авторизация
"""

import uvicorn
import sys
import os

# Добавляем путь к модулям проекта
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'lib'))

if __name__ == "__main__":
    print("=" * 80)
    print("MOS Archive Intelligent Indexing Backend API")
    print("=" * 80)
    print("Запуск полного backend API сервера...")
    print()
    print("Доступные модули:")
    print("  Upload Module      - Загрузка файлов")
    print("  Preprocess Module  - Предобработка изображений")
    print("  OCR Module        - Распознавание текста")
    print("  Attributes Module - Извлечение атрибутов")
    print("  Report Module      - Генерация отчётов")
    print("  Stats Module       - Статистика")
    print("  Auth Module        - Авторизация")
    print("  Placeholders Module - Заглушки для оффлайн работы")
    print()
    print("API будет доступно по адресу: http://localhost:8000")
    print("Документация API: http://localhost:8000/docs")
    print("ReDoc документация: http://localhost:8000/redoc")
    print("Проверка состояния: http://localhost:8000/health")
    print("Информация об API: http://localhost:8000/info")
    print()
    print("Для остановки сервера нажмите Ctrl+C")
    print("=" * 80)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,  # Автоматическая перезагрузка при изменении кода
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n" + "=" * 80)
        print("Сервер остановлен пользователем")
        print("=" * 80)
    except Exception as e:
        print(f"\nОшибка запуска сервера: {e}")
        print("Проверьте, что все зависимости установлены:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
