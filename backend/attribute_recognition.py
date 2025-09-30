"""
Модуль атрибутивного распознавания
Содержит функции для извлечения структурированных данных из текста документов
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime


def extract_attributes(text: str) -> Dict[str, str]:
    """
    Извлекает атрибуты из текста документа
    
    Args:
        text: Входной текст для анализа
        
    Returns:
        Словарь с извлеченными атрибутами:
        {
            "fio": "ФИО",
            "date": "дата", 
            "address": "адрес",
            "archive_code": "архивный шифр",
            "document_number": "номер документа",
            "organization": "организация"
        }
    """
    print("Извлекаем атрибуты из текста...")
    
    # Инициализируем результат
    attributes = {
        "fio": "",
        "date": "",
        "address": "",
        "archive_code": "",
        "document_number": "",
        "organization": ""
    }
    
    # TODO: Здесь будут применяться следующие алгоритмы:
    # 1. Named Entity Recognition (NER) с использованием spaCy или transformers
    # 2. Регулярные выражения для специфических паттернов
    # 3. Машинное обучение для извлечения именованных сущностей
    # 4. Контекстный анализ для определения типов данных
    # 5. Валидация извлеченных данных
    
    # Простейшие регулярные выражения для заглушки
    fio_patterns = [
        r'[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.',  # Иванов И.И.
        r'[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+',  # Иванов Иван Иванович
    ]
    
    date_patterns = [
        r'\d{1,2}[./]\d{1,2}[./]\d{4}',  # 15.03.2024 или 15/03/2024
        r'\d{1,2}\s+[а-яё]+\s+\d{4}',  # 15 марта 2024
    ]
    
    address_patterns = [
        r'[А-ЯЁ][а-яё]+,\s*[А-ЯЁ][а-яё]+,\s*[А-ЯЁ][а-яё]+',  # Город, улица, дом
        r'[А-ЯЁ][а-яё]+\s+обл\.',  # Московская обл.
    ]
    
    # Поиск ФИО
    for pattern in fio_patterns:
        match = re.search(pattern, text)
        if match:
            attributes["fio"] = match.group()
            break
    
    # Поиск даты
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            attributes["date"] = match.group()
            break
    
    # Поиск адреса
    for pattern in address_patterns:
        match = re.search(pattern, text)
        if match:
            attributes["address"] = match.group()
            break
    
    # Поиск архивного шифра (примеры: Ф.123, ОП.456, Д.789)
    archive_match = re.search(r'[ФОПД]\.\d+', text)
    if archive_match:
        attributes["archive_code"] = archive_match.group()
    
    # Поиск номера документа
    doc_match = re.search(r'№\s*\d+', text)
    if doc_match:
        attributes["document_number"] = doc_match.group()
    
    # Поиск организации
    org_match = re.search(r'[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+)*', text)
    if org_match:
        attributes["organization"] = org_match.group()
    
    print(f"Извлечено атрибутов: {len([v for v in attributes.values() if v])}")
    return attributes


def extract_attributes_with_positions(text: str) -> Dict[str, Dict[str, any]]:
    """
    Извлекает атрибуты с позициями в тексте
    
    Args:
        text: Входной текст для анализа
        
    Returns:
        Словарь с атрибутами и их позициями:
        {
            "fio": {"value": "Иванов И.И.", "start": 10, "end": 20},
            "date": {"value": "15.03.2024", "start": 25, "end": 35}
        }
    """
    print("Извлекаем атрибуты с позициями...")
    
    attributes = {}
    
    # Поиск ФИО с позициями
    fio_patterns = [
        r'[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.',
        r'[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+',
    ]
    
    for pattern in fio_patterns:
        match = re.search(pattern, text)
        if match:
            attributes["fio"] = {
                "value": match.group(),
                "start": match.start(),
                "end": match.end()
            }
            break
    
    # Поиск даты с позициями
    date_patterns = [
        r'\d{1,2}[./]\d{1,2}[./]\d{4}',
        r'\d{1,2}\s+[а-яё]+\s+\d{4}',
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            attributes["date"] = {
                "value": match.group(),
                "start": match.start(),
                "end": match.end()
            }
            break
    
    # Поиск адреса с позициями
    address_patterns = [
        r'[А-ЯЁ][а-яё]+,\s*[А-ЯЁ][а-яё]+,\s*[А-ЯЁ][а-яё]+',
        r'[А-ЯЁ][а-яё]+\s+обл\.',
    ]
    
    for pattern in address_patterns:
        match = re.search(pattern, text)
        if match:
            attributes["address"] = {
                "value": match.group(),
                "start": match.start(),
                "end": match.end()
            }
            break
    
    print(f"Извлечено атрибутов с позициями: {len(attributes)}")
    return attributes


def validate_extracted_attributes(attributes: Dict[str, str]) -> Dict[str, bool]:
    """
    Валидирует извлеченные атрибуты
    
    Args:
        attributes: Словарь с извлеченными атрибутами
        
    Returns:
        Словарь с результатами валидации:
        {
            "fio": True,
            "date": False,
            "address": True
        }
    """
    print("Валидируем извлеченные атрибуты...")
    
    validation_results = {}
    
    # Валидация ФИО
    if attributes.get("fio"):
        # Проверяем, что ФИО содержит хотя бы фамилию и инициалы
        fio = attributes["fio"]
        validation_results["fio"] = len(fio.split()) >= 2
    else:
        validation_results["fio"] = False
    
    # Валидация даты
    if attributes.get("date"):
        date = attributes["date"]
        # Простая проверка формата даты
        validation_results["date"] = bool(re.match(r'\d{1,2}[./]\d{1,2}[./]\d{4}', date))
    else:
        validation_results["date"] = False
    
    # Валидация адреса
    if attributes.get("address"):
        address = attributes["address"]
        # Проверяем, что адрес содержит несколько слов
        validation_results["address"] = len(address.split()) >= 2
    else:
        validation_results["address"] = False
    
    # Валидация архивного шифра
    if attributes.get("archive_code"):
        code = attributes["archive_code"]
        validation_results["archive_code"] = bool(re.match(r'[ФОПД]\.\d+', code))
    else:
        validation_results["archive_code"] = False
    
    # Валидация номера документа
    if attributes.get("document_number"):
        number = attributes["document_number"]
        validation_results["document_number"] = bool(re.match(r'№\s*\d+', number))
    else:
        validation_results["document_number"] = False
    
    # Валидация организации
    if attributes.get("organization"):
        org = attributes["organization"]
        validation_results["organization"] = len(org.split()) >= 2
    else:
        validation_results["organization"] = False
    
    print(f"Валидация завершена. Успешно: {sum(validation_results.values())}/{len(validation_results)}")
    return validation_results


def highlight_text_with_attributes(text: str, attributes: Dict[str, Dict[str, any]]) -> str:
    """
    Подсвечивает атрибуты в тексте HTML-тегами
    
    Args:
        text: Исходный текст
        attributes: Атрибуты с позициями
        
    Returns:
        Текст с подсвеченными атрибутами
    """
    print("Подсвечиваем атрибуты в тексте...")
    
    if not attributes:
        return text
    
    # Сортируем атрибуты по позиции (с конца к началу, чтобы не сбить индексы)
    sorted_attributes = sorted(
        attributes.items(),
        key=lambda x: x[1]["start"],
        reverse=True
    )
    
    highlighted_text = text
    
    for attr_name, attr_data in sorted_attributes:
        start = attr_data["start"]
        end = attr_data["end"]
        value = attr_data["value"]
        
        # Создаем HTML-тег для подсветки
        html_tag = f'<span class="attribute-{attr_name}" data-attribute="{attr_name}">{value}</span>'
        
        # Заменяем текст на подсвеченную версию
        highlighted_text = highlighted_text[:start] + html_tag + highlighted_text[end:]
    
    print(f"Подсвечено атрибутов: {len(attributes)}")
    return highlighted_text


def get_attribute_statistics(attributes: Dict[str, str]) -> Dict[str, int]:
    """
    Возвращает статистику по извлеченным атрибутам
    
    Args:
        attributes: Словарь с извлеченными атрибутами
        
    Returns:
        Словарь со статистикой
    """
    stats = {
        "total_attributes": len(attributes),
        "filled_attributes": len([v for v in attributes.values() if v]),
        "empty_attributes": len([v for v in attributes.values() if not v])
    }
    
    # Статистика по типам атрибутов
    for attr_name, attr_value in attributes.items():
        stats[f"{attr_name}_filled"] = 1 if attr_value else 0
    
    return stats


def export_attributes_to_json(attributes: Dict[str, str]) -> str:
    """
    Экспортирует атрибуты в JSON-формат
    
    Args:
        attributes: Словарь с атрибутами
        
    Returns:
        JSON-строка с атрибутами
    """
    import json
    
    # Добавляем метаданные
    export_data = {
        "extraction_date": datetime.now().isoformat(),
        "attributes": attributes,
        "statistics": get_attribute_statistics(attributes)
    }
    
    return json.dumps(export_data, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    # Тестовый текст
    test_text = """
    Документ №123 от 15.03.2024
    Иванов Иван Иванович
    Адрес: Москва, ул. Тверская, д. 1
    Организация: ООО "Рога и копыта"
    Архивный шифр: Ф.123, ОП.456, Д.789
    """
    
    print("=" * 50)
    print("ТЕСТИРОВАНИЕ МОДУЛЯ АТРИБУТИВНОГО РАСПОЗНАВАНИЯ")
    print("=" * 50)
    
    # Тест 1: Извлечение атрибутов
    print("\n1. Извлечение атрибутов:")
    attributes = extract_attributes(test_text)
    for key, value in attributes.items():
        print(f"  {key}: {value}")
    
    # Тест 2: Извлечение с позициями
    print("\n2. Извлечение с позициями:")
    attributes_with_pos = extract_attributes_with_positions(test_text)
    for key, data in attributes_with_pos.items():
        print(f"  {key}: {data['value']} (позиция {data['start']}-{data['end']})")
    
    # Тест 3: Валидация
    print("\n3. Валидация атрибутов:")
    validation = validate_extracted_attributes(attributes)
    for key, is_valid in validation.items():
        status = "✓" if is_valid else "✗"
        print(f"  {key}: {status}")
    
    # Тест 4: Подсветка
    print("\n4. Подсветка атрибутов:")
    highlighted = highlight_text_with_attributes(test_text, attributes_with_pos)
    print(highlighted)
    
    # Тест 5: Статистика
    print("\n5. Статистика:")
    stats = get_attribute_statistics(attributes)
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # Тест 6: Экспорт в JSON
    print("\n6. Экспорт в JSON:")
    json_export = export_attributes_to_json(attributes)
    print(json_export)
