"""
Модуль предобработки изображений
Обрабатывает изображения документов для улучшения качества распознавания
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import logging
import time
from datetime import datetime

# Импортируем функции предобработки из модуля
from image_processing import ImageProcessor

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер для маршрутов предобработки
router = APIRouter(prefix="/preprocess", tags=["preprocess"])

# Модели данных
class PreprocessRequest(BaseModel):
    file_id: str
    steps: Optional[List[str]] = None
    parameters: Optional[Dict[str, Any]] = None

class PreprocessResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

class ProcessingStep(BaseModel):
    name: str
    description: str
    parameters: Optional[Dict[str, Any]] = None

# Доступные этапы обработки
AVAILABLE_STEPS = {
    "correct_perspective": {
        "name": "Коррекция перспективы",
        "description": "Исправление искажений перспективы документа"
    },
    "align_image": {
        "name": "Выравнивание изображения",
        "description": "Поворот изображения для устранения наклона"
    },
    "enhance_contrast": {
        "name": "Улучшение контрастности",
        "description": "Повышение контрастности для лучшей читаемости"
    },
    "remove_noise": {
        "name": "Удаление шума",
        "description": "Очистка изображения от артефактов и шума"
    },
    "binarize_image": {
        "name": "Бинаризация",
        "description": "Преобразование в черно-белое изображение"
    },
    "enhance_resolution": {
        "name": "Улучшение разрешения",
        "description": "Повышение качества и четкости изображения"
    },
    "remove_background": {
        "name": "Удаление фона",
        "description": "Изоляция содержимого от фона"
    }
}

# Глобальный процессор изображений
image_processor = ImageProcessor()

@router.get("/steps")
async def get_available_steps() -> JSONResponse:
    """
    Получение списка доступных этапов предобработки
    
    Returns:
        JSON со списком этапов обработки
    """
    try:
        logger.info("Получение списка доступных этапов предобработки")
        
        steps = []
        for step_id, step_info in AVAILABLE_STEPS.items():
            steps.append({
                "id": step_id,
                "name": step_info["name"],
                "description": step_info["description"]
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "steps": steps,
                    "total_steps": len(steps)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении списка этапов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка этапов: {str(e)}"
        )

@router.post("/process")
async def preprocess_image(request: PreprocessRequest) -> JSONResponse:
    """
    Предобработка изображения с указанными этапами
    
    Args:
        request: Запрос на предобработку
        
    Returns:
        JSON с результатами обработки
    """
    try:
        logger.info(f"Начинаем предобработку файла: {request.file_id}")
        
        # Поиск файла в директории uploads
        upload_dir = "uploads"
        file_path = None
        
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                if filename.startswith(request.file_id):
                    file_path = os.path.join(upload_dir, filename)
                    break
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail="Файл не найден"
            )
        
        # Определяем этапы обработки
        if request.steps is None:
            steps = [
                "correct_perspective",
                "align_image",
                "enhance_contrast",
                "remove_noise",
                "binarize_image"
            ]
        else:
            # Валидация этапов
            invalid_steps = [step for step in request.steps if step not in AVAILABLE_STEPS]
            if invalid_steps:
                raise HTTPException(
                    status_code=400,
                    detail=f"Неизвестные этапы обработки: {', '.join(invalid_steps)}"
                )
            steps = request.steps
        
        # Создаем заглушку изображения для обработки
        class MockImage:
            def __init__(self, path: str):
                self.path = path
                self.name = os.path.basename(path)
            
            def __str__(self):
                return f"MockImage({self.name})"
        
        # Загружаем "изображение"
        image = MockImage(file_path)
        
        # Выполняем предобработку
        start_time = time.time()
        processed_image = image_processor.process_document(image, steps)
        processing_time = time.time() - start_time
        
        # Получаем лог обработки
        processing_log = image_processor.get_processing_log()
        
        # Генерируем имя обработанного файла
        processed_filename = f"processed_{request.file_id}_{int(time.time())}.jpg"
        processed_path = os.path.join("processed", processed_filename)
        
        # Создаем директорию для обработанных файлов
        os.makedirs("processed", exist_ok=True)
        
        # В реальной реализации здесь будет сохранение обработанного изображения
        # processed_image.save(processed_path)
        
        logger.info(f"Предобработка завершена за {processing_time:.2f} секунд")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Предобработка завершена успешно",
                "data": {
                    "file_id": request.file_id,
                    "original_file": file_path,
                    "processed_file": processed_path,
                    "processing_steps": steps,
                    "processing_time": processing_time,
                    "processing_log": processing_log,
                    "parameters": request.parameters or {},
                    "processed_at": datetime.now().isoformat()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при предобработке файла {request.file_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при предобработке: {str(e)}"
        )

@router.post("/step/{step_name}")
async def process_single_step(step_name: str, request: PreprocessRequest) -> JSONResponse:
    """
    Выполнение одного этапа предобработки
    
    Args:
        step_name: Название этапа обработки
        request: Запрос на обработку
        
    Returns:
        JSON с результатами обработки
    """
    try:
        logger.info(f"Выполнение этапа '{step_name}' для файла: {request.file_id}")
        
        # Проверка существования этапа
        if step_name not in AVAILABLE_STEPS:
            raise HTTPException(
                status_code=400,
                detail=f"Неизвестный этап обработки: {step_name}"
            )
        
        # Поиск файла
        upload_dir = "uploads"
        file_path = None
        
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                if filename.startswith(request.file_id):
                    file_path = os.path.join(upload_dir, filename)
                    break
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail="Файл не найден"
            )
        
        # Создаем заглушку изображения
        class MockImage:
            def __init__(self, path: str):
                self.path = path
                self.name = os.path.basename(path)
            
            def __str__(self):
                return f"MockImage({self.name})"
        
        image = MockImage(file_path)
        
        # Выполняем этап обработки
        start_time = time.time()
        
        if hasattr(image_processor, step_name):
            method = getattr(image_processor, step_name)
            processed_image = method(image)
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Метод обработки '{step_name}' не найден"
            )
        
        processing_time = time.time() - start_time
        
        # Получаем лог обработки
        processing_log = image_processor.get_processing_log()
        
        logger.info(f"Этап '{step_name}' завершен за {processing_time:.2f} секунд")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": f"Этап '{step_name}' выполнен успешно",
                "data": {
                    "file_id": request.file_id,
                    "step_name": step_name,
                    "step_info": AVAILABLE_STEPS[step_name],
                    "processing_time": processing_time,
                    "processing_log": processing_log,
                    "parameters": request.parameters or {},
                    "processed_at": datetime.now().isoformat()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при выполнении этапа '{step_name}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при выполнении этапа: {str(e)}"
        )

@router.get("/status/{file_id}")
async def get_processing_status(file_id: str) -> JSONResponse:
    """
    Получение статуса обработки файла
    
    Args:
        file_id: ID файла
        
    Returns:
        JSON со статусом обработки
    """
    try:
        logger.info(f"Получение статуса обработки файла: {file_id}")
        
        # Проверяем наличие исходного файла
        upload_dir = "uploads"
        original_file = None
        
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                if filename.startswith(file_id):
                    original_file = os.path.join(upload_dir, filename)
                    break
        
        if not original_file:
            raise HTTPException(
                status_code=404,
                detail="Исходный файл не найден"
            )
        
        # Проверяем наличие обработанных файлов
        processed_dir = "processed"
        processed_files = []
        
        if os.path.exists(processed_dir):
            for filename in os.listdir(processed_dir):
                if file_id in filename:
                    file_path = os.path.join(processed_dir, filename)
                    stat = os.stat(file_path)
                    processed_files.append({
                        "filename": filename,
                        "file_path": file_path,
                        "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "file_size": stat.st_size
                    })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "file_id": file_id,
                    "original_file": original_file,
                    "processed_files": processed_files,
                    "processing_status": "completed" if processed_files else "pending",
                    "total_processed": len(processed_files)
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении статуса обработки: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении статуса: {str(e)}"
        )

@router.get("/health")
async def health_check() -> JSONResponse:
    """
    Проверка состояния модуля предобработки
    
    Returns:
        JSON со статусом модуля
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "Preprocess module is working",
            "data": {
                "available_steps": len(AVAILABLE_STEPS),
                "processor_initialized": image_processor is not None
            }
        }
    )
