# -*- coding: utf-8 -*-
"""
Модуль заглушек для системы интеллектуального индексирования
Содержит все текстовые заглушки и примеры данных для работы в оффлайн режиме
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/placeholders", tags=["placeholders"])

# Заглушки для отчётов
REPORT_PLACEHOLDERS = {
    "fileName": "document.pdf",
    "archiveCode": "01-0203-0745-000002",
    "recognizedText": "Recognized text from document...",
    "archiveId": "1",
    "fund": "203",
    "opis": "745",
    "delo": "2",
    "fio": "Ivanov I.I.",
    "date": "15.03.2024",
    "documentNumber": "12345",
    "address": "Moscow, Example Street, 1",
    "organization": "Archive Institution",
    "fileSize": "2.5 MB",
    "status": "Processed",
    "default": "Sample data"
}

# Заглушки для статистики
STATISTICS_PLACEHOLDERS = {
    "processed_count_range": (10, 60),
    "avg_confidence_range": (0.7, 1.0),
    "low_confidence_count_range": (1, 9),
    "total_elements_range": (100, 300),
    "high_confidence_count_range": (80, 230),
    "medium_confidence_count_range": (20, 70),
    "processing_time_avg_range": (10, 40),
    "daily_processed_range": (5, 20),
    "daily_confidence_range": (0.8, 1.0),
    "daily_low_confidence_range": (1, 6)
}

# Заглушки для текстовых полей
TEXT_PLACEHOLDERS = {
    "edit_placeholder": "Enter text for editing...",
    "ocr_placeholder": "Text will be available after OCR processing...",
    "login_placeholder": "Enter login",
    "password_placeholder": "Enter password",
    "email_placeholder": "Enter email",
    "confirm_password_placeholder": "Confirm password",
    "general_text_placeholder": "Enter text..."
}

# Заглушки для статусов обработки
PROCESSING_STATUS_PLACEHOLDERS = {
    "completed": "Uploaded",
    "processing": "Processing", 
    "error": "Error",
    "pending": "Waiting for preprocessing"
}

# Заглушки для описаний полей отчёта
REPORT_FIELD_DESCRIPTIONS = {
    "fileName": "Document file name",
    "archiveCode": "Archive document code",
    "recognizedText": "Recognized text from document",
    "archiveId": "Archive identifier",
    "fund": "Fund number",
    "opis": "Inventory number",
    "delo": "Case number",
    "fio": "Full name",
    "date": "Document date",
    "documentNumber": "Document number",
    "address": "Address",
    "organization": "Organization",
    "processingDate": "Processing date",
    "fileSize": "File size",
    "status": "Processing status"
}

@router.get("/report")
async def get_report_placeholders() -> Dict[str, Any]:
    """
    Get placeholders for reports
    """
    return {
        "placeholders": REPORT_PLACEHOLDERS,
        "descriptions": REPORT_FIELD_DESCRIPTIONS
    }

@router.get("/statistics")
async def get_statistics_placeholders() -> Dict[str, Any]:
    """
    Get placeholders for statistics
    """
    return {
        "placeholders": STATISTICS_PLACEHOLDERS
    }

@router.get("/statistics/mock")
async def get_mock_statistics() -> Dict[str, Any]:
    """
    Generate mock statistics data
    """
    ranges = STATISTICS_PLACEHOLDERS
    
    return {
        "processed_count": random.randint(*ranges["processed_count_range"]),
        "avg_confidence": round(random.uniform(*ranges["avg_confidence_range"]), 3),
        "low_confidence_count": random.randint(*ranges["low_confidence_count_range"]),
        "total_elements": random.randint(*ranges["total_elements_range"]),
        "high_confidence_count": random.randint(*ranges["high_confidence_count_range"]),
        "medium_confidence_count": random.randint(*ranges["medium_confidence_count_range"]),
        "processing_time_avg": round(random.uniform(*ranges["processing_time_avg_range"]), 2),
        "last_updated": datetime.now().isoformat()
    }

@router.get("/statistics/daily")
async def get_mock_daily_statistics() -> List[Dict[str, Any]]:
    """
    Generate mock daily statistics for the last 7 days
    """
    ranges = STATISTICS_PLACEHOLDERS
    days = []
    today = datetime.now()
    
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        days.append({
            "date": date.strftime("%Y-%m-%d"),
            "processed_count": random.randint(*ranges["daily_processed_range"]),
            "avg_confidence": round(random.uniform(*ranges["daily_confidence_range"]), 3),
            "low_confidence_count": random.randint(*ranges["daily_low_confidence_range"])
        })
    
    return days

@router.get("/text")
async def get_text_placeholders() -> Dict[str, str]:
    """
    Get text placeholders
    """
    return TEXT_PLACEHOLDERS

@router.get("/processing-status")
async def get_processing_status_placeholders() -> Dict[str, str]:
    """
    Get processing status placeholders
    """
    return PROCESSING_STATUS_PLACEHOLDERS

@router.get("/all")
async def get_all_placeholders() -> Dict[str, Any]:
    """
    Get all placeholders at once
    """
    return {
        "report": REPORT_PLACEHOLDERS,
        "statistics": STATISTICS_PLACEHOLDERS,
        "text": TEXT_PLACEHOLDERS,
        "processing_status": PROCESSING_STATUS_PLACEHOLDERS,
        "report_descriptions": REPORT_FIELD_DESCRIPTIONS
    }

@router.get("/report/sample")
async def get_report_sample_data() -> Dict[str, Any]:
    """
    Get sample data for report
    """
    return {
        "fileName": REPORT_PLACEHOLDERS["fileName"],
        "archiveCode": REPORT_PLACEHOLDERS["archiveCode"],
        "recognizedText": REPORT_PLACEHOLDERS["recognizedText"],
        "archiveId": REPORT_PLACEHOLDERS["archiveId"],
        "fund": REPORT_PLACEHOLDERS["fund"],
        "opis": REPORT_PLACEHOLDERS["opis"],
        "delo": REPORT_PLACEHOLDERS["delo"],
        "fio": REPORT_PLACEHOLDERS["fio"],
        "date": REPORT_PLACEHOLDERS["date"],
        "documentNumber": REPORT_PLACEHOLDERS["documentNumber"],
        "address": REPORT_PLACEHOLDERS["address"],
        "organization": REPORT_PLACEHOLDERS["organization"],
        "processingDate": datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
        "fileSize": REPORT_PLACEHOLDERS["fileSize"],
        "status": REPORT_PLACEHOLDERS["status"]
    }
