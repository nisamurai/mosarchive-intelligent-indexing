#!/usr/bin/env python3
"""
Скрипт для запуска backend API сервера авторизации
"""

import uvicorn
import sys
import os

# Добавляем путь к модулям проекта
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'lib'))

if __name__ == "__main__":
    print("Запуск backend API сервера авторизации...")
    print("API будет доступен по адресу: http://localhost:8000")
    print("Документация API: http://localhost:8000/docs")
    print("Для остановки сервера нажмите Ctrl+C")
    print("-" * 50)
    
    try:
        uvicorn.run(
            "auth_backend:app",
            host="0.0.0.0",
            port=8000,
            reload=True,  # Автоматическая перезагрузка при изменении кода
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\nСервер остановлен пользователем")
    except Exception as e:
        print(f"Ошибка запуска сервера: {e}")
        sys.exit(1)
