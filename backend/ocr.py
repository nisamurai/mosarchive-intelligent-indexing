"""
Модуль распознавания текста (OCR)
Обрабатывает изображения документов и извлекает текст
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import logging
import time
from datetime import datetime

# Импортируем функции OCR из модуля
from image_processing import recognize_text

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер для маршрутов OCR
router = APIRouter(prefix="/ocr", tags=["ocr"])

# Модели данных
class OCRRequest(BaseModel):
    file_id: str
    language: Optional[str] = "ru"
    model_type: Optional[str] = "printed"
    confidence_threshold: Optional[float] = 0.7
    preprocess: Optional[bool] = True

class OCRResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

class TextBlock(BaseModel):
    text: str
    confidence: float
    bbox: Optional[Dict[str, int]] = None
    language: str

# Поддерживаемые языки
SUPPORTED_LANGUAGES = {
    "ru": "Русский",
    "en": "Английский",
    "de": "Немецкий",
    "fr": "Французский",
    "es": "Испанский",
    "it": "Итальянский"
}

# Типы моделей
MODEL_TYPES = {
    "printed": "Печатный текст",
    "handwritten": "Рукописный текст",
    "mixed": "Смешанный текст"
}

@router.get("/languages")
async def get_supported_languages() -> JSONResponse:
    """
    Получение списка поддерживаемых языков
    
    Returns:
        JSON со списком языков
    """
    try:
        logger.info("Получение списка поддерживаемых языков")
        
        languages = []
        for lang_code, lang_name in SUPPORTED_LANGUAGES.items():
            languages.append({
                "code": lang_code,
                "name": lang_name
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "languages": languages,
                    "total_languages": len(languages)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении списка языков: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка языков: {str(e)}"
        )

@router.get("/model-types")
async def get_model_types() -> JSONResponse:
    """
    Получение списка типов моделей OCR
    
    Returns:
        JSON со списком типов моделей
    """
    try:
        logger.info("Получение списка типов моделей")
        
        model_types = []
        for type_code, type_name in MODEL_TYPES.items():
            model_types.append({
                "code": type_code,
                "name": type_name
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "model_types": model_types,
                    "total_types": len(model_types)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении типов моделей: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении типов моделей: {str(e)}"
        )

@router.post("/recognize")
async def recognize_text_from_image(request: OCRRequest) -> JSONResponse:
    """
    Распознавание текста на изображении
    
    Args:
        request: Запрос на распознавание текста
        
    Returns:
        JSON с результатами распознавания
    """
    try:
        logger.info(f"Начинаем распознавание текста для файла: {request.file_id}")
        
        # Валидация параметров
        if request.language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый язык: {request.language}"
            )
        
        if request.model_type not in MODEL_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый тип модели: {request.model_type}"
            )
        
        if not 0.0 <= request.confidence_threshold <= 1.0:
            raise HTTPException(
                status_code=400,
                detail="Порог уверенности должен быть от 0.0 до 1.0"
            )
        
        # Поиск файла
        file_path = None
        
        # Сначала ищем в обработанных файлах
        processed_dir = "processed"
        if os.path.exists(processed_dir):
            for filename in os.listdir(processed_dir):
                if request.file_id in filename:
                    file_path = os.path.join(processed_dir, filename)
                    break
        
        # Если не найден, ищем в исходных файлах
        if not file_path:
            upload_dir = "uploads"
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
        
        # Выполняем распознавание текста
        start_time = time.time()
        
        # В реальной реализации здесь будет вызов OCR библиотеки
        # Пока используем заглушку из существующего модуля
        recognized_text = recognize_text(
            file_path, 
            language=request.language, 
            model_type=request.model_type
        )
        
        processing_time = time.time() - start_time
        
        # Анализируем результат
        text_length = len(recognized_text)
        word_count = len(recognized_text.split())
        
        # В реальной реализации здесь будет анализ уверенности
        # Пока используем заглушку
        confidence_scores = {
            "overall": 0.85,
            "characters": 0.90,
            "words": 0.80
        }
        
        # Создаем блоки текста (в реальной реализации будет разбивка по строкам/словам)
        text_blocks = [
            {
                "text": recognized_text,
                "confidence": confidence_scores["overall"],
                "bbox": {"x": 0, "y": 0, "width": 800, "height": 600},
                "language": request.language
            }
        ]
        
        # Сохраняем результат распознавания
        result_filename = f"ocr_result_{request.file_id}_{int(time.time())}.txt"
        result_path = os.path.join("ocr_results", result_filename)
        
        # Создаем директорию для результатов OCR
        os.makedirs("ocr_results", exist_ok=True)
        
        # Сохраняем текст в файл
        with open(result_path, "w", encoding="utf-8") as f:
            f.write(recognized_text)
        
        logger.info(f"Распознавание завершено за {processing_time:.2f} секунд")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Распознавание текста завершено успешно",
                "data": {
                    "file_id": request.file_id,
                    "source_file": file_path,
                    "recognized_text": recognized_text,
                    "text_blocks": text_blocks,
                    "statistics": {
                        "text_length": text_length,
                        "word_count": word_count,
                        "character_count": len(recognized_text.replace(" ", "")),
                        "line_count": len(recognized_text.split("\n"))
                    },
                    "confidence_scores": confidence_scores,
                    "parameters": {
                        "language": request.language,
                        "model_type": request.model_type,
                        "confidence_threshold": request.confidence_threshold,
                        "preprocess": request.preprocess
                    },
                    "result_file": result_path,
                    "processing_time": processing_time,
                    "recognized_at": datetime.now().isoformat()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при распознавании текста: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при распознавании текста: {str(e)}"
        )

@router.get("/result/{file_id}")
async def get_ocr_result(file_id: str) -> JSONResponse:
    """
    Получение результата распознавания текста
    
    Args:
        file_id: ID файла
        
    Returns:
        JSON с результатом распознавания
    """
    try:
        logger.info(f"Получение результата OCR для файла: {file_id}")
        
        # Поиск файла с результатом OCR
        ocr_results_dir = "ocr_results"
        result_file = None
        
        if os.path.exists(ocr_results_dir):
            for filename in os.listdir(ocr_results_dir):
                if file_id in filename:
                    result_file = os.path.join(ocr_results_dir, filename)
                    break
        
        if not result_file or not os.path.exists(result_file):
            raise HTTPException(
                status_code=404,
                detail="Результат распознавания не найден"
            )
        
        # Читаем результат
        with open(result_file, "r", encoding="utf-8") as f:
            recognized_text = f.read()
        
        # Получаем информацию о файле
        stat = os.stat(result_file)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "file_id": file_id,
                    "result_file": result_file,
                    "recognized_text": recognized_text,
                    "statistics": {
                        "text_length": len(recognized_text),
                        "word_count": len(recognized_text.split()),
                        "character_count": len(recognized_text.replace(" ", "")),
                        "line_count": len(recognized_text.split("\n"))
                    },
                    "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "file_size": stat.st_size
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении результата OCR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении результата OCR: {str(e)}"
        )

@router.get("/results")
async def list_ocr_results() -> JSONResponse:
    """
    Получение списка всех результатов распознавания
    
    Returns:
        JSON со списком результатов
    """
    try:
        logger.info("Получение списка результатов OCR")
        
        ocr_results_dir = "ocr_results"
        results = []
        
        if os.path.exists(ocr_results_dir):
            for filename in os.listdir(ocr_results_dir):
                if filename.endswith(".txt"):
                    file_path = os.path.join(ocr_results_dir, filename)
                    stat = os.stat(file_path)
                    
                    # Извлекаем file_id из имени файла
                    file_id = filename.replace("ocr_result_", "").split("_")[0]
                    
                    results.append({
                        "file_id": file_id,
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
                    "results": results,
                    "total_results": len(results)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении списка результатов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка результатов: {str(e)}"
        )

@router.delete("/result/{file_id}")
async def delete_ocr_result(file_id: str) -> JSONResponse:
    """
    Удаление результата распознавания
    
    Args:
        file_id: ID файла
        
    Returns:
        JSON с результатом удаления
    """
    try:
        logger.info(f"Удаление результата OCR для файла: {file_id}")
        
        # Поиск файла с результатом OCR
        ocr_results_dir = "ocr_results"
        result_file = None
        
        if os.path.exists(ocr_results_dir):
            for filename in os.listdir(ocr_results_dir):
                if file_id in filename:
                    result_file = os.path.join(ocr_results_dir, filename)
                    break
        
        if not result_file or not os.path.exists(result_file):
            raise HTTPException(
                status_code=404,
                detail="Результат распознавания не найден"
            )
        
        # Удаляем файл
        os.remove(result_file)
        
        logger.info(f"Результат OCR удален: {result_file}")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Результат распознавания удален",
                "data": {
                    "file_id": file_id,
                    "deleted_file": result_file
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при удалении результата OCR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении результата OCR: {str(e)}"
        )

@router.get("/health")
async def health_check() -> JSONResponse:
    """
    Проверка состояния модуля OCR
    
    Returns:
        JSON со статусом модуля
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "OCR module is working",
            "data": {
                "supported_languages": len(SUPPORTED_LANGUAGES),
                "model_types": len(MODEL_TYPES),
                "ocr_results_dir": "ocr_results"
            }
        }
    )
