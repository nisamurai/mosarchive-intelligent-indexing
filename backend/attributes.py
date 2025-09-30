"""
Модуль извлечения атрибутов
Извлекает структурированные данные из распознанного текста
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import logging
import time
from datetime import datetime

# Импортируем функции извлечения атрибутов из существующего модуля
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src', 'lib'))
from attribute_recognition import (
    extract_attributes, 
    extract_attributes_with_positions, 
    validate_extracted_attributes,
    highlight_text_with_attributes
)

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер для маршрутов извлечения атрибутов
router = APIRouter(prefix="/attributes", tags=["attributes"])

# Модели данных
class AttributeExtractionRequest(BaseModel):
    file_id: str
    text: Optional[str] = None
    extraction_rules: Optional[Dict[str, Any]] = None
    validation_enabled: Optional[bool] = True

class AttributeExtractionResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

class ExtractedAttribute(BaseModel):
    name: str
    value: str
    confidence: float
    position: Optional[Dict[str, int]] = None
    validated: bool

# Доступные типы атрибутов
ATTRIBUTE_TYPES = {
    "fio": {
        "name": "ФИО",
        "description": "Фамилия, имя, отчество",
        "pattern": "Иванов И.И."
    },
    "date": {
        "name": "Дата",
        "description": "Дата в различных форматах",
        "pattern": "05.04.1960"
    },
    "address": {
        "name": "Адрес",
        "description": "Адрес места жительства или работы",
        "pattern": "г. Москва, ул. Ленина, д. 1"
    },
    "archive_code": {
        "name": "Архивный шифр",
        "description": "Архивный код документа",
        "pattern": "01-0203-0745-000002"
    },
    "document_number": {
        "name": "Номер документа",
        "description": "Номер дела или документа",
        "pattern": "Дело №123"
    },
    "organization": {
        "name": "Организация",
        "description": "Название организации или учреждения",
        "pattern": "ООО 'Рога и копыта'"
    }
}

@router.get("/types")
async def get_attribute_types() -> JSONResponse:
    """
    Получение списка доступных типов атрибутов
    
    Returns:
        JSON со списком типов атрибутов
    """
    try:
        logger.info("Получение списка типов атрибутов")
        
        attribute_types = []
        for attr_code, attr_info in ATTRIBUTE_TYPES.items():
            attribute_types.append({
                "code": attr_code,
                "name": attr_info["name"],
                "description": attr_info["description"],
                "pattern": attr_info["pattern"]
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "attribute_types": attribute_types,
                    "total_types": len(attribute_types)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении типов атрибутов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении типов атрибутов: {str(e)}"
        )

@router.post("/extract")
async def extract_attributes_from_text(request: AttributeExtractionRequest) -> JSONResponse:
    """
    Извлечение атрибутов из текста
    
    Args:
        request: Запрос на извлечение атрибутов
        
    Returns:
        JSON с извлеченными атрибутами
    """
    try:
        logger.info(f"Начинаем извлечение атрибутов для файла: {request.file_id}")
        
        # Получаем текст для анализа
        text = request.text
        
        if not text:
            # Если текст не передан, ищем результат OCR
            ocr_results_dir = "ocr_results"
            if os.path.exists(ocr_results_dir):
                for filename in os.listdir(ocr_results_dir):
                    if request.file_id in filename:
                        result_file = os.path.join(ocr_results_dir, filename)
                        with open(result_file, "r", encoding="utf-8") as f:
                            text = f.read()
                        break
            
            if not text:
                raise HTTPException(
                    status_code=404,
                    detail="Текст для анализа не найден. Убедитесь, что выполнено распознавание текста."
                )
        
        # Выполняем извлечение атрибутов
        start_time = time.time()
        
        # Извлекаем атрибуты
        extracted_attributes = extract_attributes(text)
        
        # Извлекаем атрибуты с позициями для подсветки
        attributes_with_positions = extract_attributes_with_positions(text)
        
        # Валидируем атрибуты если включено
        validation_results = {}
        if request.validation_enabled:
            validation_results = validate_extracted_attributes(extracted_attributes)
        
        # Создаем HTML с подсветкой
        highlighted_html = highlight_text_with_attributes(text, attributes_with_positions)
        
        processing_time = time.time() - start_time
        
        # Формируем результат
        attributes_list = []
        for attr_name, attr_value in extracted_attributes.items():
            if attr_value:  # Показываем только непустые значения
                attributes_list.append({
                    "name": attr_name,
                    "value": attr_value,
                    "confidence": 0.85,  # В реальной реализации будет рассчитываться
                    "validated": validation_results.get(attr_name, True),
                    "type_info": ATTRIBUTE_TYPES.get(attr_name, {})
                })
        
        # Сохраняем результат извлечения
        result_filename = f"attributes_{request.file_id}_{int(time.time())}.json"
        result_path = os.path.join("attribute_results", result_filename)
        
        # Создаем директорию для результатов
        os.makedirs("attribute_results", exist_ok=True)
        
        # Сохраняем результат в файл
        import json
        result_data = {
            "file_id": request.file_id,
            "extracted_attributes": extracted_attributes,
            "attributes_with_positions": attributes_with_positions,
            "validation_results": validation_results,
            "highlighted_html": highlighted_html,
            "extraction_time": datetime.now().isoformat()
        }
        
        with open(result_path, "w", encoding="utf-8") as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Извлечение атрибутов завершено за {processing_time:.2f} секунд")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Извлечение атрибутов завершено успешно",
                "data": {
                    "file_id": request.file_id,
                    "source_text": text,
                    "extracted_attributes": extracted_attributes,
                    "attributes_list": attributes_list,
                    "attributes_with_positions": attributes_with_positions,
                    "validation_results": validation_results,
                    "highlighted_html": highlighted_html,
                    "statistics": {
                        "total_attributes": len(extracted_attributes),
                        "extracted_attributes": len([v for v in extracted_attributes.values() if v]),
                        "validated_attributes": len([v for v in validation_results.values() if v]) if validation_results else 0,
                        "text_length": len(text)
                    },
                    "extraction_rules": request.extraction_rules or {},
                    "result_file": result_path,
                    "processing_time": processing_time,
                    "extracted_at": datetime.now().isoformat()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при извлечении атрибутов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при извлечении атрибутов: {str(e)}"
        )

@router.get("/result/{file_id}")
async def get_attribute_result(file_id: str) -> JSONResponse:
    """
    Получение результата извлечения атрибутов
    
    Args:
        file_id: ID файла
        
    Returns:
        JSON с результатом извлечения
    """
    try:
        logger.info(f"Получение результата извлечения атрибутов для файла: {file_id}")
        
        # Поиск файла с результатом
        attribute_results_dir = "attribute_results"
        result_file = None
        
        if os.path.exists(attribute_results_dir):
            for filename in os.listdir(attribute_results_dir):
                if file_id in filename:
                    result_file = os.path.join(attribute_results_dir, filename)
                    break
        
        if not result_file or not os.path.exists(result_file):
            raise HTTPException(
                status_code=404,
                detail="Результат извлечения атрибутов не найден"
            )
        
        # Читаем результат
        import json
        with open(result_file, "r", encoding="utf-8") as f:
            result_data = json.load(f)
        
        # Получаем информацию о файле
        stat = os.stat(result_file)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "file_id": file_id,
                    "result_file": result_file,
                    "extracted_attributes": result_data.get("extracted_attributes", {}),
                    "attributes_with_positions": result_data.get("attributes_with_positions", {}),
                    "validation_results": result_data.get("validation_results", {}),
                    "highlighted_html": result_data.get("highlighted_html", ""),
                    "extraction_time": result_data.get("extraction_time"),
                    "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "file_size": stat.st_size
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении результата извлечения: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении результата извлечения: {str(e)}"
        )

@router.get("/results")
async def list_attribute_results() -> JSONResponse:
    """
    Получение списка всех результатов извлечения атрибутов
    
    Returns:
        JSON со списком результатов
    """
    try:
        logger.info("Получение списка результатов извлечения атрибутов")
        
        attribute_results_dir = "attribute_results"
        results = []
        
        if os.path.exists(attribute_results_dir):
            for filename in os.listdir(attribute_results_dir):
                if filename.endswith(".json"):
                    file_path = os.path.join(attribute_results_dir, filename)
                    stat = os.stat(file_path)
                    
                    # Извлекаем file_id из имени файла
                    file_id = filename.replace("attributes_", "").split("_")[0]
                    
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

@router.post("/validate")
async def validate_attributes(attributes: Dict[str, str]) -> JSONResponse:
    """
    Валидация извлеченных атрибутов
    
    Args:
        attributes: Словарь с атрибутами для валидации
        
    Returns:
        JSON с результатами валидации
    """
    try:
        logger.info("Валидация атрибутов")
        
        # Выполняем валидацию
        validation_results = validate_extracted_attributes(attributes)
        
        # Формируем детальный отчет
        validation_report = []
        for attr_name, is_valid in validation_results.items():
            validation_report.append({
                "attribute": attr_name,
                "value": attributes.get(attr_name, ""),
                "is_valid": is_valid,
                "type_info": ATTRIBUTE_TYPES.get(attr_name, {})
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Валидация завершена",
                "data": {
                    "validation_results": validation_results,
                    "validation_report": validation_report,
                    "statistics": {
                        "total_attributes": len(attributes),
                        "valid_attributes": len([v for v in validation_results.values() if v]),
                        "invalid_attributes": len([v for v in validation_results.values() if not v])
                    }
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при валидации атрибутов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при валидации атрибутов: {str(e)}"
        )

@router.delete("/result/{file_id}")
async def delete_attribute_result(file_id: str) -> JSONResponse:
    """
    Удаление результата извлечения атрибутов
    
    Args:
        file_id: ID файла
        
    Returns:
        JSON с результатом удаления
    """
    try:
        logger.info(f"Удаление результата извлечения атрибутов для файла: {file_id}")
        
        # Поиск файла с результатом
        attribute_results_dir = "attribute_results"
        result_file = None
        
        if os.path.exists(attribute_results_dir):
            for filename in os.listdir(attribute_results_dir):
                if file_id in filename:
                    result_file = os.path.join(attribute_results_dir, filename)
                    break
        
        if not result_file or not os.path.exists(result_file):
            raise HTTPException(
                status_code=404,
                detail="Результат извлечения атрибутов не найден"
            )
        
        # Удаляем файл
        os.remove(result_file)
        
        logger.info(f"Результат извлечения атрибутов удален: {result_file}")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Результат извлечения атрибутов удален",
                "data": {
                    "file_id": file_id,
                    "deleted_file": result_file
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при удалении результата извлечения: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении результата извлечения: {str(e)}"
        )

@router.get("/health")
async def health_check() -> JSONResponse:
    """
    Проверка состояния модуля извлечения атрибутов
    
    Returns:
        JSON со статусом модуля
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "Attributes module is working",
            "data": {
                "attribute_types": len(ATTRIBUTE_TYPES),
                "attribute_results_dir": "attribute_results"
            }
        }
    )
