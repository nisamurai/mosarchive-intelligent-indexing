"""
Модуль генерации отчётов
Создает отчёты на основе обработанных документов и извлеченных атрибутов
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import logging
import time
import json
from datetime import datetime

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер для маршрутов генерации отчётов
router = APIRouter(prefix="/report", tags=["report"])

# Модели данных
class ReportRequest(BaseModel):
    file_ids: List[str]
    report_type: str = "standard"
    format: str = "json"
    include_images: bool = False
    include_attributes: bool = True
    include_ocr_text: bool = True
    template: Optional[str] = None

class ReportResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

# Доступные типы отчётов
REPORT_TYPES = {
    "standard": {
        "name": "Стандартный отчёт",
        "description": "Базовый отчёт с основными данными документа"
    },
    "detailed": {
        "name": "Детальный отчёт",
        "description": "Подробный отчёт со всеми этапами обработки"
    },
    "summary": {
        "name": "Сводный отчёт",
        "description": "Краткий отчёт с ключевыми данными"
    },
    "archive": {
        "name": "Архивный отчёт",
        "description": "Отчёт в формате для архивного хранения"
    }
}

# Доступные форматы отчётов
REPORT_FORMATS = {
    "json": "JSON",
    "html": "HTML",
    "pdf": "PDF",
    "csv": "CSV",
    "xml": "XML"
}

@router.get("/types")
async def get_report_types() -> JSONResponse:
    """
    Получение списка доступных типов отчётов
    
    Returns:
        JSON со списком типов отчётов
    """
    try:
        logger.info("Получение списка типов отчётов")
        
        report_types = []
        for type_code, type_info in REPORT_TYPES.items():
            report_types.append({
                "code": type_code,
                "name": type_info["name"],
                "description": type_info["description"]
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "report_types": report_types,
                    "total_types": len(report_types)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении типов отчётов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении типов отчётов: {str(e)}"
        )

@router.get("/formats")
async def get_report_formats() -> JSONResponse:
    """
    Получение списка доступных форматов отчётов
    
    Returns:
        JSON со списком форматов отчётов
    """
    try:
        logger.info("Получение списка форматов отчётов")
        
        report_formats = []
        for format_code, format_name in REPORT_FORMATS.items():
            report_formats.append({
                "code": format_code,
                "name": format_name
            })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "report_formats": report_formats,
                    "total_formats": len(report_formats)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении форматов отчётов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении форматов отчётов: {str(e)}"
        )

@router.post("/generate")
async def generate_report(request: ReportRequest) -> JSONResponse:
    """
    Генерация отчёта на основе обработанных документов
    
    Args:
        request: Запрос на генерацию отчёта
        
    Returns:
        JSON с результатами генерации отчёта
    """
    try:
        logger.info(f"Начинаем генерацию отчёта типа '{request.report_type}' для {len(request.file_ids)} файлов")
        
        # Валидация параметров
        if request.report_type not in REPORT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый тип отчёта: {request.report_type}"
            )
        
        if request.format not in REPORT_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый формат отчёта: {request.format}"
            )
        
        if len(request.file_ids) > 50:  # Ограничение на количество файлов
            raise HTTPException(
                status_code=400,
                detail="Максимальное количество файлов в отчёте: 50"
            )
        
        # Собираем данные для отчёта
        start_time = time.time()
        report_data = {
            "report_info": {
                "type": request.report_type,
                "format": request.format,
                "generated_at": datetime.now().isoformat(),
                "total_files": len(request.file_ids)
            },
            "files": []
        }
        
        # Обрабатываем каждый файл
        for file_id in request.file_ids:
            file_data = await _collect_file_data(file_id, request)
            if file_data:
                report_data["files"].append(file_data)
        
        # Генерируем отчёт в указанном формате
        report_filename = f"report_{request.report_type}_{int(time.time())}.{request.format}"
        report_path = os.path.join("reports", report_filename)
        
        # Создаем директорию для отчётов
        os.makedirs("reports", exist_ok=True)
        
        # Сохраняем отчёт
        if request.format == "json":
            with open(report_path, "w", encoding="utf-8") as f:
                json.dump(report_data, f, ensure_ascii=False, indent=2)
        else:
            # Для других форматов создаем заглушку
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(f"Отчёт в формате {request.format}\n")
                f.write(f"Сгенерирован: {datetime.now().isoformat()}\n")
                f.write(f"Тип отчёта: {request.report_type}\n")
                f.write(f"Количество файлов: {len(report_data['files'])}\n")
        
        processing_time = time.time() - start_time
        
        logger.info(f"Отчёт сгенерирован за {processing_time:.2f} секунд")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Отчёт успешно сгенерирован",
                "data": {
                    "report_id": report_filename.replace(f".{request.format}", ""),
                    "report_type": request.report_type,
                    "report_format": request.format,
                    "report_path": report_path,
                    "report_data": report_data,
                    "statistics": {
                        "total_files": len(request.file_ids),
                        "processed_files": len(report_data["files"]),
                        "processing_time": processing_time
                    },
                    "generated_at": datetime.now().isoformat()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при генерации отчёта: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при генерации отчёта: {str(e)}"
        )

async def _collect_file_data(file_id: str, request: ReportRequest) -> Optional[Dict[str, Any]]:
    """
    Сбор данных о файле для отчёта
    
    Args:
        file_id: ID файла
        request: Запрос на генерацию отчёта
        
    Returns:
        Словарь с данными файла или None
    """
    try:
        file_data = {
            "file_id": file_id,
            "original_file": None,
            "processed_file": None,
            "ocr_result": None,
            "attributes": None,
            "processing_log": []
        }
        
        # Ищем исходный файл
        upload_dir = "uploads"
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                if filename.startswith(file_id):
                    file_data["original_file"] = {
                        "filename": filename,
                        "path": os.path.join(upload_dir, filename)
                    }
                    break
        
        # Ищем обработанный файл
        processed_dir = "processed"
        if os.path.exists(processed_dir):
            for filename in os.listdir(processed_dir):
                if file_id in filename:
                    file_data["processed_file"] = {
                        "filename": filename,
                        "path": os.path.join(processed_dir, filename)
                    }
                    break
        
        # Ищем результат OCR
        if request.include_ocr_text:
            ocr_results_dir = "ocr_results"
            if os.path.exists(ocr_results_dir):
                for filename in os.listdir(ocr_results_dir):
                    if file_id in filename:
                        result_file = os.path.join(ocr_results_dir, filename)
                        with open(result_file, "r", encoding="utf-8") as f:
                            file_data["ocr_result"] = {
                                "text": f.read(),
                                "result_file": result_file
                            }
                        break
        
        # Ищем извлеченные атрибуты
        if request.include_attributes:
            attribute_results_dir = "attribute_results"
            if os.path.exists(attribute_results_dir):
                for filename in os.listdir(attribute_results_dir):
                    if file_id in filename:
                        result_file = os.path.join(attribute_results_dir, filename)
                        with open(result_file, "r", encoding="utf-8") as f:
                            file_data["attributes"] = json.load(f)
                        break
        
        return file_data
        
    except Exception as e:
        logger.error(f"Ошибка при сборе данных файла {file_id}: {str(e)}")
        return None

@router.get("/download/{report_id}")
async def download_report(report_id: str) -> FileResponse:
    """
    Скачивание сгенерированного отчёта
    
    Args:
        report_id: ID отчёта
        
    Returns:
        Файл отчёта
    """
    try:
        logger.info(f"Скачивание отчёта: {report_id}")
        
        # Поиск файла отчёта
        reports_dir = "reports"
        report_file = None
        
        if os.path.exists(reports_dir):
            for filename in os.listdir(reports_dir):
                if report_id in filename:
                    report_file = os.path.join(reports_dir, filename)
                    break
        
        if not report_file or not os.path.exists(report_file):
            raise HTTPException(
                status_code=404,
                detail="Отчёт не найден"
            )
        
        # Определяем media type
        file_extension = os.path.splitext(report_file)[1].lower()
        media_types = {
            ".json": "application/json",
            ".html": "text/html",
            ".pdf": "application/pdf",
            ".csv": "text/csv",
            ".xml": "application/xml"
        }
        
        media_type = media_types.get(file_extension, "application/octet-stream")
        
        return FileResponse(
            path=report_file,
            media_type=media_type,
            filename=os.path.basename(report_file)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при скачивании отчёта: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при скачивании отчёта: {str(e)}"
        )

@router.get("/list")
async def list_reports() -> JSONResponse:
    """
    Получение списка всех сгенерированных отчётов
    
    Returns:
        JSON со списком отчётов
    """
    try:
        logger.info("Получение списка отчётов")
        
        reports_dir = "reports"
        reports = []
        
        if os.path.exists(reports_dir):
            for filename in os.listdir(reports_dir):
                file_path = os.path.join(reports_dir, filename)
                if os.path.isfile(file_path):
                    stat = os.stat(file_path)
                    
                    # Извлекаем информацию из имени файла
                    parts = filename.replace(".", "_").split("_")
                    report_type = parts[1] if len(parts) > 1 else "unknown"
                    report_format = parts[-1] if len(parts) > 2 else "unknown"
                    
                    reports.append({
                        "report_id": filename.replace(f".{report_format}", ""),
                        "filename": filename,
                        "file_path": file_path,
                        "report_type": report_type,
                        "report_format": report_format,
                        "file_size": stat.st_size,
                        "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat()
                    })
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "data": {
                    "reports": reports,
                    "total_reports": len(reports)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Ошибка при получении списка отчётов: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка отчётов: {str(e)}"
        )

@router.delete("/{report_id}")
async def delete_report(report_id: str) -> JSONResponse:
    """
    Удаление отчёта
    
    Args:
        report_id: ID отчёта
        
    Returns:
        JSON с результатом удаления
    """
    try:
        logger.info(f"Удаление отчёта: {report_id}")
        
        # Поиск файла отчёта
        reports_dir = "reports"
        report_file = None
        
        if os.path.exists(reports_dir):
            for filename in os.listdir(reports_dir):
                if report_id in filename:
                    report_file = os.path.join(reports_dir, filename)
                    break
        
        if not report_file or not os.path.exists(report_file):
            raise HTTPException(
                status_code=404,
                detail="Отчёт не найден"
            )
        
        # Удаляем файл
        os.remove(report_file)
        
        logger.info(f"Отчёт удален: {report_file}")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Отчёт успешно удален",
                "data": {
                    "report_id": report_id,
                    "deleted_file": report_file
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при удалении отчёта: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении отчёта: {str(e)}"
        )

@router.get("/health")
async def health_check() -> JSONResponse:
    """
    Проверка состояния модуля генерации отчётов
    
    Returns:
        JSON со статусом модуля
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "message": "Report module is working",
            "data": {
                "report_types": len(REPORT_TYPES),
                "report_formats": len(REPORT_FORMATS),
                "reports_dir": "reports"
            }
        }
    )
