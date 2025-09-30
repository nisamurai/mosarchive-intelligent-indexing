"""
Главный файл FastAPI приложения
Объединяет все модули системы в единое API
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
import os
import sys
from datetime import datetime

# Модули теперь находятся в backend директории

# Импортируем все модули
from upload import router as upload_router
from preprocess import router as preprocess_router
from ocr import router as ocr_router
from attributes import router as attributes_router
from report import router as report_router
from stats import router as stats_router
from placeholders import router as placeholders_router

# Импортируем модуль авторизации
from auth_backend import app as auth_app, verify_token, get_current_user_from_token

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Создаем главное FastAPI приложение
app = FastAPI(
    title="MOS Archive Intelligent Indexing API",
    description="API для системы интеллектуального индексирования архивных документов",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  
        "http://localhost:5175",  
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# Создаем необходимые директории
directories = [
    "uploads",
    "processed", 
    "ocr_results",
    "attribute_results",
    "reports",
    "logs"
]

for directory in directories:
    os.makedirs(directory, exist_ok=True)

# Подключаем роутеры модулей
app.include_router(upload_router)
app.include_router(preprocess_router)
app.include_router(ocr_router)
app.include_router(attributes_router)
app.include_router(report_router)
app.include_router(stats_router)
app.include_router(placeholders_router)

# Подключаем роутеры авторизации
app.include_router(auth_app.router)

# Middleware для логирования запросов
@app.middleware("http")
async def log_requests(request, call_next):
    """Логирование всех HTTP запросов"""
    start_time = datetime.now()
    
    # Логируем входящий запрос
    logger.info(f"Входящий запрос: {request.method} {request.url}")
    
    # Обрабатываем запрос
    response = await call_next(request)
    
    # Логируем время обработки
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"Запрос обработан за {process_time:.3f}s: {response.status_code}")
    
    return response

# Middleware для обработки ошибок
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Глобальная обработка исключений"""
    logger.error(f"Необработанная ошибка: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Внутренняя ошибка сервера",
            "detail": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else "Обратитесь к администратору"
        }
    )

# Основные маршруты API

@app.get("/")
async def root():
    """
    Корневой маршрут API
    
    Returns:
        JSON с информацией об API
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "MOS Archive Intelligent Indexing API",
            "version": "1.0.0",
            "docs": "/docs",
            "redoc": "/redoc",
            "modules": [
                "upload - Загрузка файлов",
                "preprocess - Предобработка изображений", 
                "ocr - Распознавание текста",
                "attributes - Извлечение атрибутов",
                "report - Генерация отчётов",
                "stats - Статистика",
                "auth - Авторизация"
            ],
            "timestamp": datetime.now().isoformat()
        }
    )

@app.get("/health")
async def health_check():
    """
    Проверка состояния API
    
    Returns:
        JSON со статусом всех модулей
    """
    try:
        # Проверяем состояние всех модулей
        modules_status = {
            "upload": "ok",
            "preprocess": "ok", 
            "ocr": "ok",
            "attributes": "ok",
            "report": "ok",
            "stats": "ok",
            "auth": "ok"
        }
        
        # Проверяем доступность директорий
        directories_status = {}
        for directory in directories:
            directories_status[directory] = "ok" if os.path.exists(directory) else "error"
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "ok",
                "message": "API работает нормально",
                "timestamp": datetime.now().isoformat(),
                "modules": modules_status,
                "directories": directories_status,
                "system_info": {
                    "python_version": sys.version,
                    "working_directory": os.getcwd(),
                    "environment": os.getenv("ENVIRONMENT", "development")
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при проверке состояния: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Ошибка при проверке состояния",
                "detail": str(e)
            }
        )

@app.get("/info")
async def get_api_info():
    """
    Получение информации об API
    
    Returns:
        JSON с подробной информацией об API
    """
    return JSONResponse(
        status_code=200,
        content={
            "api_name": "MOS Archive Intelligent Indexing API",
            "version": "1.0.0",
            "description": "API для системы интеллектуального индексирования архивных документов",
            "author": "MOS Archive Team",
            "endpoints": {
                "upload": {
                    "description": "Загрузка и управление файлами документов",
                    "endpoints": [
                        "POST /upload/file - Загрузка одного файла",
                        "POST /upload/files - Загрузка нескольких файлов",
                        "GET /upload/files - Список загруженных файлов",
                        "DELETE /upload/file/{file_id} - Удаление файла"
                    ]
                },
                "preprocess": {
                    "description": "Предобработка изображений для улучшения качества",
                    "endpoints": [
                        "GET /preprocess/steps - Список этапов обработки",
                        "POST /preprocess/process - Полная обработка изображения",
                        "POST /preprocess/step/{step_name} - Выполнение одного этапа",
                        "GET /preprocess/status/{file_id} - Статус обработки"
                    ]
                },
                "ocr": {
                    "description": "Распознавание текста на изображениях",
                    "endpoints": [
                        "GET /ocr/languages - Поддерживаемые языки",
                        "GET /ocr/model-types - Типы моделей OCR",
                        "POST /ocr/recognize - Распознавание текста",
                        "GET /ocr/result/{file_id} - Результат распознавания"
                    ]
                },
                "attributes": {
                    "description": "Извлечение структурированных атрибутов из текста",
                    "endpoints": [
                        "GET /attributes/types - Типы атрибутов",
                        "POST /attributes/extract - Извлечение атрибутов",
                        "GET /attributes/result/{file_id} - Результат извлечения",
                        "POST /attributes/validate - Валидация атрибутов"
                    ]
                },
                "report": {
                    "description": "Генерация отчётов по обработанным документам",
                    "endpoints": [
                        "GET /report/types - Типы отчётов",
                        "GET /report/formats - Форматы отчётов",
                        "POST /report/generate - Генерация отчёта",
                        "GET /report/download/{report_id} - Скачивание отчёта"
                    ]
                },
                "stats": {
                    "description": "Статистика по работе системы",
                    "endpoints": [
                        "GET /stats/overview - Общая статистика",
                        "GET /stats/files - Статистика файлов",
                        "GET /stats/processing - Статистика обработки",
                        "GET /stats/ocr - Статистика OCR"
                    ]
                },
                "auth": {
                    "description": "Авторизация и аутентификация пользователей",
                    "endpoints": [
                        "POST /register - Регистрация пользователя",
                        "POST /login - Авторизация",
                        "GET /me - Информация о пользователе",
                        "POST /logout - Выход из системы"
                    ]
                }
            },
            "authentication": {
                "type": "Bearer Token (JWT)",
                "header": "Authorization: Bearer <token>",
                "required": "Для защищенных endpoints"
            },
            "cors": {
                "enabled": True,
                "origins": [
                    "http://localhost:5173",
                    "http://localhost:3000"
                ]
            }
        }
    )

# Защищенные маршруты (требуют авторизации)

@app.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user_from_token)):
    """
    Получение информации о текущем пользователе
    
    Args:
        current_user: Текущий пользователь (из JWT токена)
        
    Returns:
        JSON с информацией о пользователе
    """
    return JSONResponse(
        status_code=200,
        content={
            "username": current_user["username"],
            "email": current_user["email"],
            "is_active": current_user["is_active"],
            "created_at": current_user["created_at"]
        }
    )

@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user_from_token)):
    """
    Пример защищенного маршрута
    
    Args:
        current_user: Текущий пользователь (из JWT токена)
        
    Returns:
        JSON с информацией о пользователе
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "Доступ к защищенному ресурсу разрешен",
            "user": current_user,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.get("/admin")
async def admin_route(current_user: dict = Depends(get_current_user_from_token)):
    """
    Административный маршрут (пример)
    
    Args:
        current_user: Текущий пользователь
        
    Returns:
        JSON с административной информацией
    """
    # В реальной реализации здесь будет проверка прав администратора
    if current_user != "admin":
        raise HTTPException(
            status_code=403,
            detail="Недостаточно прав для доступа к административным функциям"
        )
    
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "Административный доступ разрешен",
            "admin_user": current_user,
            "system_info": {
                "total_files": len(os.listdir("uploads")) if os.path.exists("uploads") else 0,
                "total_processed": len(os.listdir("processed")) if os.path.exists("processed") else 0,
                "total_reports": len(os.listdir("reports")) if os.path.exists("reports") else 0
            },
            "timestamp": datetime.now().isoformat()
        }
    )

# Обработчики ошибок

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Обработка ошибки 404"""
    return JSONResponse(
        status_code=404,
        content={
            "status": "error",
            "message": "Ресурс не найден",
            "path": str(request.url),
            "method": request.method
        }
    )

@app.exception_handler(405)
async def method_not_allowed_handler(request, exc):
    """Обработка ошибки 405"""
    return JSONResponse(
        status_code=405,
        content={
            "status": "error",
            "message": "Метод не разрешен",
            "path": str(request.url),
            "method": request.method
        }
    )

@app.exception_handler(422)
async def validation_error_handler(request, exc):
    """Обработка ошибок валидации"""
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": "Ошибка валидации данных",
            "detail": str(exc)
        }
    )

# Запуск приложения
if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("MOS Archive Intelligent Indexing API")
    print("=" * 60)
    print("API будет доступно по адресу: http://localhost:8000")
    print("Документация API: http://localhost:8000/docs")
    print("ReDoc документация: http://localhost:8000/redoc")
    print("Проверка состояния: http://localhost:8000/health")
    print("=" * 60)
    
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
        print("\nСервер остановлен пользователем")
    except Exception as e:
        print(f"Ошибка запуска сервера: {e}")
        sys.exit(1)
