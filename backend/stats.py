"""
Модуль статистики
Предоставляет статистику по обработке документов и работе системы
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import logging
import time
import json
from datetime import datetime, timedelta
from collections import defaultdict

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер для маршрутов статистики
router = APIRouter(prefix="/stats", tags=["stats"])

# Модели данных
class StatsRequest(BaseModel):
    period: Optional[str] = "week"  # day, week, month, year
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    group_by: Optional[str] = "day"  # hour, day, week, month

class StatsResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

# Периоды для статистики
STATS_PERIODS = {
    "day": "День",
    "week": "Неделя",
    "month": "Месяц",
    "year": "Год"
}

# Группировки для статистики
STATS_GROUP_BY = {
    "hour": "По часам",
    "day": "По дням",
    "week": "По неделям",
    "month": "По месяцам"
}

@router.get("/overview")
async def get_overview_stats() -> JSONResponse:
    """
    Получение общей статистики системы
    
    Returns:
        JSON с общей статистикой
    """
    try:
        logger.info("Получение общей статистики системы")
        
        # Собираем статистику по всем модулям
        stats = {
            "system_info": {
                "uptime": "24h 15m 30s",  # В реальной реализации будет рассчитываться
                "version": "1.0.0",
                "last_update": datetime.now().isoformat()
            },
            "files": await _get_files_stats(),
            "processing": await _get_processing_stats(),
            "ocr": await _get_ocr_stats(),
            "attributes": await _get_attributes_stats(),
            "reports": await _get_reports_stats(),
            "performance": await _get_performance_stats()
        }
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": stats
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении общей статистики: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении общей статистики: {str(e)}"
        )

@router.get("/files")
async def get_files_stats(request: StatsRequest = Depends()) -> JSONResponse:
    """
    Получение статистики по файлам
    
    Args:
        request: Параметры запроса статистики
        
    Returns:
        JSON со статистикой файлов
    """
    try:
        logger.info("Получение статистики по файлам")
        
        stats = await _get_files_stats(request.period, request.start_date, request.end_date)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": stats
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики файлов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении статистики файлов: {str(e)}"
        )

@router.get("/processing")
async def get_processing_stats(request: StatsRequest = Depends()) -> JSONResponse:
    """
    Получение статистики по обработке
    
    Args:
        request: Параметры запроса статистики
        
    Returns:
        JSON со статистикой обработки
    """
    try:
        logger.info("Получение статистики по обработке")
        
        stats = await _get_processing_stats(request.period, request.start_date, request.end_date)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": stats
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики обработки: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении статистики обработки: {str(e)}"
        )

@router.get("/ocr")
async def get_ocr_stats(request: StatsRequest = Depends()) -> JSONResponse:
    """
    Получение статистики по OCR
    
    Args:
        request: Параметры запроса статистики
        
    Returns:
        JSON со статистикой OCR
    """
    try:
        logger.info("Получение статистики по OCR")
        
        stats = await _get_ocr_stats(request.period, request.start_date, request.end_date)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": stats
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики OCR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении статистики OCR: {str(e)}"
        )

@router.get("/attributes")
async def get_attributes_stats(request: StatsRequest = Depends()) -> JSONResponse:
    """
    Получение статистики по извлечению атрибутов
    
    Args:
        request: Параметры запроса статистики
        
    Returns:
        JSON со статистикой атрибутов
    """
    try:
        logger.info("Получение статистики по извлечению атрибутов")
        
        stats = await _get_attributes_stats(request.period, request.start_date, request.end_date)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": stats
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики атрибутов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении статистики атрибутов: {str(e)}"
        )
        
@router.get("/reports")
async def get_reports_stats(request: StatsRequest = Depends()) -> JSONResponse:
    """
    Получение статистики по отчётам
    
    Args:
        request: Параметры запроса статистики
        
    Returns:
        JSON со статистикой отчётов
    """
    try:
        logger.info("Получение статистики по отчётам")
        
        stats = await _get_reports_stats(request.period, request.start_date, request.end_date)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": stats
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики отчётов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении статистики отчётов: {str(e)}"
        )

@router.get("/performance")
async def get_performance_stats(request: StatsRequest = Depends()) -> JSONResponse:
    """
    Получение статистики производительности
    
    Args:
        request: Параметры запроса статистики
        
    Returns:
        JSON со статистикой производительности
    """
    try:
        logger.info("Получение статистики производительности")
        
        stats = await _get_performance_stats(request.period, request.start_date, request.end_date)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": stats
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики производительности: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении статистики производительности: {str(e)}"
        )

@router.get("/periods")
async def get_stats_periods() -> JSONResponse:
    """
    Получение доступных периодов для статистики
    
    Returns:
        JSON со списком периодов
    """
    try:
        logger.info("Получение доступных периодов для статистики")
        
        periods = []
        for period_code, period_name in STATS_PERIODS.items():
            periods.append({
                "code": period_code,
                "name": period_name
            })
        
        group_by_options = []
        for group_code, group_name in STATS_GROUP_BY.items():
            group_by_options.append({
                "code": group_code,
                "name": group_name
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "periods": periods,
                    "group_by_options": group_by_options
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении периодов статистики: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении периодов статистики: {str(e)}"
        )

# Вспомогательные функции для сбора статистики

async def _get_files_stats(period: str = "week", start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """Получение статистики по файлам"""
    try:
        upload_dir = "uploads"
        files_count = 0
        total_size = 0
        file_types = defaultdict(int)
        
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                if os.path.isfile(os.path.join(upload_dir, filename)):
                    files_count += 1
                    file_path = os.path.join(upload_dir, filename)
                    file_size = os.path.getsize(file_path)
                    total_size += file_size
                    
                    # Определяем тип файла
                    file_ext = os.path.splitext(filename)[1].lower()
                    file_types[file_ext] += 1
        
        return {
            "total_files": files_count,
            "total_size": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "file_types": dict(file_types),
            "average_file_size": round(total_size / files_count, 2) if files_count > 0 else 0
        }
    except Exception as e:
        logger.error(f"Ошибка при сборе статистики файлов: {str(e)}")
        return {"error": str(e)}

async def _get_processing_stats(period: str = "week", start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """Получение статистики по обработке"""
    try:
        processed_dir = "processed"
        processed_count = 0
        processing_times = []
        
        if os.path.exists(processed_dir):
            for filename in os.listdir(processed_dir):
                if os.path.isfile(os.path.join(processed_dir, filename)):
                    processed_count += 1
                    # В реальной реализации здесь будет анализ времени обработки
                    processing_times.append(2.5)  # Заглушка
        
        return {
            "total_processed": processed_count,
            "average_processing_time": round(sum(processing_times) / len(processing_times), 2) if processing_times else 0,
            "total_processing_time": round(sum(processing_times), 2),
            "processing_steps": {
                "correct_perspective": processed_count,
                "align_image": processed_count,
                "enhance_contrast": processed_count,
                "remove_noise": processed_count,
                "binarize_image": processed_count
            }
        }
    except Exception as e:
        logger.error(f"Ошибка при сборе статистики обработки: {str(e)}")
        return {"error": str(e)}

async def _get_ocr_stats(period: str = "week", start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """Получение статистики по OCR"""
    try:
        ocr_results_dir = "ocr_results"
        ocr_count = 0
        total_text_length = 0
        languages = defaultdict(int)
        
        if os.path.exists(ocr_results_dir):
            for filename in os.listdir(ocr_results_dir):
                if filename.endswith(".txt"):
                    ocr_count += 1
                    file_path = os.path.join(ocr_results_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                        total_text_length += len(text)
                        # В реальной реализации здесь будет определение языка
                        languages["ru"] += 1
        
        return {
            "total_ocr_results": ocr_count,
            "total_text_length": total_text_length,
            "average_text_length": round(total_text_length / ocr_count, 2) if ocr_count > 0 else 0,
            "languages": dict(languages),
            "confidence_scores": {
                "average": 0.85,
                "min": 0.70,
                "max": 0.95
            }
        }
    except Exception as e:
        logger.error(f"Ошибка при сборе статистики OCR: {str(e)}")
        return {"error": str(e)}

async def _get_attributes_stats(period: str = "week", start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """Получение статистики по извлечению атрибутов"""
    try:
        attribute_results_dir = "attribute_results"
        attributes_count = 0
        total_attributes = 0
        attribute_types = defaultdict(int)
        
        if os.path.exists(attribute_results_dir):
            for filename in os.listdir(attribute_results_dir):
                if filename.endswith(".json"):
                    attributes_count += 1
                    file_path = os.path.join(attribute_results_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        extracted_attrs = data.get("extracted_attributes", {})
                        for attr_type, attr_value in extracted_attrs.items():
                            if attr_value:
                                attribute_types[attr_type] += 1
                                total_attributes += 1
        
        return {
            "total_attribute_extractions": attributes_count,
            "total_attributes_found": total_attributes,
            "average_attributes_per_document": round(total_attributes / attributes_count, 2) if attributes_count > 0 else 0,
            "attribute_types": dict(attribute_types),
            "validation_results": {
                "valid_attributes": int(total_attributes * 0.85),
                "invalid_attributes": int(total_attributes * 0.15)
            }
        }
    except Exception as e:
        logger.error(f"Ошибка при сборе статистики атрибутов: {str(e)}")
        return {"error": str(e)}

async def _get_reports_stats(period: str = "week", start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """Получение статистики по отчётам"""
    try:
        reports_dir = "reports"
        reports_count = 0
        report_types = defaultdict(int)
        report_formats = defaultdict(int)
        total_size = 0
        
        if os.path.exists(reports_dir):
            for filename in os.listdir(reports_dir):
                if os.path.isfile(os.path.join(reports_dir, filename)):
                    reports_count += 1
                    file_path = os.path.join(reports_dir, filename)
                    file_size = os.path.getsize(file_path)
                    total_size += file_size
                    
                    # Определяем тип и формат отчёта
                    parts = filename.replace(".", "_").split("_")
                    if len(parts) > 1:
                        report_types[parts[1]] += 1
                    if len(parts) > 2:
                        report_formats[parts[-1]] += 1
        
        return {
            "total_reports": reports_count,
            "total_size": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "report_types": dict(report_types),
            "report_formats": dict(report_formats),
            "average_report_size": round(total_size / reports_count, 2) if reports_count > 0 else 0
        }
    except Exception as e:
        logger.error(f"Ошибка при сборе статистики отчётов: {str(e)}")
        return {"error": str(e)}

async def _get_performance_stats(period: str = "week", start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    """Получение статистики производительности"""
    try:
        # В реальной реализации здесь будет сбор метрик производительности
        return {
            "average_response_time": 1.2,
            "requests_per_minute": 45,
            "error_rate": 0.02,
            "cpu_usage": 35.5,
            "memory_usage": 512.3,
            "disk_usage": 1024.7,
            "active_connections": 12,
            "queue_length": 3
        }
    except Exception as e:
        logger.error(f"Ошибка при сборе статистики производительности: {str(e)}")
        return {"error": str(e)}

@router.get("/health")
async def health_check() -> JSONResponse:
    """
    Проверка состояния модуля статистики
    
    Returns:
        JSON со статусом модуля
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "Stats module is working",
            "data": {
                "available_periods": len(STATS_PERIODS),
                "group_by_options": len(STATS_GROUP_BY)
            }
        }
    )
