"""
Модуль загрузки файлов
Обрабатывает загрузку и валидацию файлов документов
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import os
import uuid
import shutil
from datetime import datetime
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер для маршрутов загрузки
router = APIRouter(prefix="/upload", tags=["upload"])

# Конфигурация
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tiff", ".tif", ".pdf", ".bmp"}

# Создаем директорию для загрузок если её нет
os.makedirs(UPLOAD_DIR, exist_ok=True)

def validate_file(file: UploadFile) -> Dict[str, Any]:
    """
    Валидация загружаемого файла
    
    Args:
        file: Загружаемый файл
        
    Returns:
        Словарь с результатами валидации
        
    Raises:
        HTTPException: При ошибках валидации
    """
    # Проверка расширения файла
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемый формат файла. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Проверка размера файла
    if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Файл слишком большой. Максимальный размер: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    return {
        "filename": file.filename,
        "extension": file_extension,
        "content_type": file.content_type,
        "size": getattr(file, 'size', 0)
    }

@router.post("/file")
async def upload_file(file: UploadFile = File(...)) -> JSONResponse:
    """
    Загрузка одного файла
    
    Args:
        file: Загружаемый файл
        
    Returns:
        JSON с информацией о загруженном файле
    """
    try:
        logger.info(f"Начинаем загрузку файла: {file.filename}")
        
        # Валидация файла
        validation_result = validate_file(file)
        
        # Генерируем уникальное имя файла
        file_id = str(uuid.uuid4())
        file_extension = validation_result["extension"]
        new_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Получаем размер сохраненного файла
        file_size = os.path.getsize(file_path)
        
        # Логируем успешную загрузку
        logger.info(f"Файл успешно загружен: {new_filename} ({file_size} bytes)")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Файл успешно загружен",
                "data": {
                    "file_id": file_id,
                    "original_filename": file.filename,
                    "saved_filename": new_filename,
                    "file_path": file_path,
                    "file_size": file_size,
                    "content_type": file.content_type,
                    "upload_time": datetime.now().isoformat()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при загрузке файла {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при загрузке файла: {str(e)}"
        )

@router.post("/files")
async def upload_multiple_files(files: List[UploadFile] = File(...)) -> JSONResponse:
    """
    Загрузка нескольких файлов
    
    Args:
        files: Список загружаемых файлов
        
    Returns:
        JSON с информацией о загруженных файлах
    """
    try:
        logger.info(f"Начинаем загрузку {len(files)} файлов")
        
        if len(files) > 10:  # Ограничение на количество файлов
            raise HTTPException(
                status_code=400,
                detail="Максимальное количество файлов за один раз: 10"
            )
        
        uploaded_files = []
        errors = []
        
        for file in files:
            try:
                # Валидация файла
                validation_result = validate_file(file)
                
                # Генерируем уникальное имя файла
                file_id = str(uuid.uuid4())
                file_extension = validation_result["extension"]
                new_filename = f"{file_id}{file_extension}"
                file_path = os.path.join(UPLOAD_DIR, new_filename)
                
                # Сохраняем файл
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                # Получаем размер сохраненного файла
                file_size = os.path.getsize(file_path)
                
                uploaded_files.append({
                    "file_id": file_id,
                    "original_filename": file.filename,
                    "saved_filename": new_filename,
                    "file_path": file_path,
                    "file_size": file_size,
                    "content_type": file.content_type,
                    "upload_time": datetime.now().isoformat()
                })
                
                logger.info(f"Файл успешно загружен: {new_filename}")
                
            except Exception as e:
                error_msg = f"Ошибка при загрузке файла {file.filename}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": f"Загружено {len(uploaded_files)} из {len(files)} файлов",
                "data": {
                    "uploaded_files": uploaded_files,
                    "errors": errors,
                    "total_files": len(files),
                    "successful_uploads": len(uploaded_files),
                    "failed_uploads": len(errors)
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при загрузке файлов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при загрузке файлов: {str(e)}"
        )

@router.get("/files")
async def list_uploaded_files() -> JSONResponse:
    """
    Получение списка загруженных файлов
    
    Returns:
        JSON со списком файлов
    """
    try:
        logger.info("Получение списка загруженных файлов")
        
        files = []
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                file_path = os.path.join(UPLOAD_DIR, filename)
                if os.path.isfile(file_path):
                    stat = os.stat(file_path)
                    files.append({
                        "filename": filename,
                        "file_path": file_path,
                        "file_size": stat.st_size,
                        "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "modified_time": datetime.fromtimestamp(stat.st_mtime).isoformat()
                    })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "files": files,
                    "total_files": len(files)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении списка файлов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка файлов: {str(e)}"
        )

@router.delete("/file/{file_id}")
async def delete_file(file_id: str) -> JSONResponse:
    """
    Удаление загруженного файла
    
    Args:
        file_id: ID файла для удаления
        
    Returns:
        JSON с результатом удаления
    """
    try:
        logger.info(f"Удаление файла: {file_id}")
        
        # Ищем файл по ID
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                if filename.startswith(file_id):
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    os.remove(file_path)
                    
                    logger.info(f"Файл успешно удален: {filename}")
                    return JSONResponse(
                        status_code=200,
                        content={
                            "status": "success",
                            "message": "Файл успешно удален",
                            "data": {
                                "file_id": file_id,
                                "deleted_filename": filename
                            }
                        }
                    )
        
        raise HTTPException(
            status_code=404,
            detail="Файл не найден"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при удалении файла {file_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении файла: {str(e)}"
        )

@router.get("/health")
async def health_check() -> JSONResponse:
    """
    Проверка состояния модуля загрузки
    
    Returns:
        JSON со статусом модуля
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "Upload module is working",
            "data": {
                "upload_directory": UPLOAD_DIR,
                "max_file_size": MAX_FILE_SIZE,
                "allowed_extensions": list(ALLOWED_EXTENSIONS)
            }
        }
    )
