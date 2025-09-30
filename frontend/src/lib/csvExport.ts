/**
 * Утилиты для экспорта данных в CSV-формат
 * 
 * Этот модуль содержит функции для преобразования данных документов
 * в формат CSV с корректным экранированием и поддержкой русского языка.
 */

// Интерфейс для полей отчёта
export interface ReportField {
  key: string;
  label: string;
  description?: string;
  category: 'basic' | 'attributes' | 'text';
}

// Интерфейс для данных документа
export interface DocumentData {
  fileName: string;
  archiveCode?: string;
  recognizedText?: string;
  archiveId?: number;  // Номер архива из нового формата
  fund?: number;
  opis?: number;
  delo?: number;
  fio?: string;
  date?: string;
  documentNumber?: string;
  address?: string;
  organization?: string;
  processingDate?: string;
  fileSize?: number;
  status?: string;
}

/**
 * Экранирует значение для CSV-формата
 * 
 * Функция обрабатывает значения согласно стандарту RFC 4180:
 * - Значения содержащие запятые, переносы строк или двойные кавычки 
 *   заключаются в двойные кавычки
 * - Двойные кавычки в значениях удваиваются
 * - Служебные символы остаются как есть
 * 
 * @param value - значение pentru экранирования
 * @returns экранированное значение
 * 
 * Примеры:
 * - "Простое значение" -> "Простое значение"
 * - "Значение с, запятой" -> "\"Значение с, запятой\""
 * - "С кавычкой \"примера\"" -> "\"С кавычкой \"\"\"примера\"\"\"\""
 */
export const escapeCSVValue = (value: any): string => {
  // Преобразуем значение в строку
  const stringValue = String(value || '');
  
  // Проверяем, нужно ли заключать значение в кавычки
  const needsQuoting = stringValue.includes(',') || 
                       stringValue.includes('"') || 
                       stringValue.includes('\n') || 
                       stringValue.includes('\r');
  
  if (!needsQuoting) {
    return stringValue;
  }
  
  // Экранируем двойные кавычки путём их удвоения
  const escapedValue = stringValue.replace(/"/g, '""');
  
  // Заключаем в двойные кавычки
  return `"${escapedValue}"`;
};

/**
 * Получает значение поля из данных документа
 * 
 * Функция извлекает конкретное значение поля по ключу из объекта DocumentData,
 * применяя необходимые преобразования (например, форматирование размера файла).
 ^ 
 * @param document - объект с данными документа
 * @param fieldKey - ключ поля для извлечения
 * @returns обработанное значение поля
 */
export const getFieldValue = (document: DocumentData, fieldKey: string): string => {
  switch (fieldKey) {
    case 'fileName':
      return document.fileName || '';
    
    case 'archiveCode':
      return document.archiveCode || '';
    
    case 'recognizedText':
      return document.recognizedText || '';
    
    case 'archiveId':
      return document.archiveId?.toString() || '';
    
    case 'fund':
      return document.fund?.toString() || '';
    
    case 'opis':
      return document.opis?.toString() || '';
    
    case 'delo':
      return document.delo?.toString() || '';
    
    case 'fio':
      return document.fio || '';
    
    case 'date':
      return document.date || '';
    
    case 'documentNumber':
      return document.documentNumber || '';
    
    case 'address':
      return document.address || '';
    
    case 'organization':
      return document.organization || '';
    
    case 'processingDate':
      // Форматируем дату обработки в удобном для чтения виде
      return document.processingDate || new Date().toLocaleString('ru-RU');
    
    case 'fileSize':
      // Преобразуем размер файла в мегабайты с двумя знаками после запятой
      return document.fileSize 
        ? `${(document.fileSize / (1024 * 1024)).toFixed(2)} MB` 
        : '';
    
    case 'status':
      return document.status || 'Обработан';
    
    default:
      // Для неизвестных полей пытаемся получить значение как есть
      return String((document as any)[fieldKey] || '');
  }
};

/**
 * Создаёт заголовки CSV из выбранных полей
 * 
 * Функция преобразует ключи полей в читаемые русские заголовки
 * и применяет корректное экранирование для CSV-формата.
 * 
 * @param fields - массив объектов с информацией о полях
 * @param selectedFieldKeys - массив ключей выбранных полей
 * @returns массив экранированных заголовков
 */
export const createCSVHeaders = (
  fields: ReportField[], 
  selectedFieldKeys: string[]
): string[] => {
  return selectedFieldKeys.map(fieldKey => {
    const field = fields.find(f => f.key === fieldKey);
    const headerLabel = field?.label || fieldKey;
    return escapeCSVValue(headerLabel);
  });
};

/**
 * Формирует данные строки CSV из объекта документа
 * 
 * Функция извлекает значения выбранных полей из объекта документа,
 * применяет экранирование значений и возвращает готовую строку CSV.
 * 
 * @param document - объект с данными документа
 * @param selectedFieldKeys - массив ключей полей для извлечения
 * @returns строка данных для CSV (без переноса строки)
 */
export const createCSVRow = (
  document: DocumentData, 
  selectedFieldKeys: string[]
): string => {
  const rowValues = selectedFieldKeys.map(fieldKey => {
    const value = getFieldValue(document, fieldKey);
    return escapeCSVValue(value);
  });
  
  return rowValues.join(',');
};

/**
 * Генерирует BOM (Byte Order Mark) для корректного отображения UTF-8
 * 
 * BOM - это специальная последовательность байтов в начале файла,
 * которая помогает программам (особенно Excel) правильно определить
 * кодировку текста UTF-8.
 * 
 * @returns строка с BOM символом
 */
export const createUTF8BOM = (): string => {
  return '\uFEFF';
};

/**
 * Создаёт Blob-объект с CSV-данными
 * 
 * @param csvContent - строка с CSV-содержимым
 * @returns Blob-объект готовый для скачивания
 */
export const createCSVBlob = (csvContent: string): Blob => {
  return new Blob([csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
};

/**
 * Генерирует имя файла с временной меткой
 * 
 * @param baseName - базовое имя файла (без расширения)
 * @returns имя файла с временной меткой и расширением .csv
 */
export const generateFileName = (baseName: string = 'archive_report'): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `${baseName}_${timestamp}.csv`;
};

/**
 * Запускает скачивание CSV-файла
 * 
 * Функция создаёт временную ссылку и автоматически запускает
 * скачивание файла с последующим освобождением памяти.
 * 
 * @param blob - Blob-объект с данными CSV
 * @param fileName - имя файла для сохранения
 */
export const downloadCSV = (blob: Blob, fileName: string): void => {
  try {
    // Создаём временный URL для Blob
    const url = window.URL.createObjectURL(blob);
    
    // Создаём ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Добавляем ссылку в DOM и запускаем скачивание
    document.body.appendChild(link);
    link.click();
    
    // Убираем ссылку из DOM
    document.body.removeChild(link);
    
    // Освобождаем память
    window.URL.revokeObjectURL(url);
    
    console.log(`CSV файл "${fileName}" успешно загружен`);
  } catch (error) {
    console.error('Ошибка при скачивании CSV файла:', error);
    throw new Error('Не удалось загрузить файл');
  }
};

/**
 * Основная функция генерации и скачивания CSV-отчёта
 * 
 * Полная функция экспорта документов в CSV-формат с:
 * - Корректным экранированием значений
 * - Поддержкой русского языка (UTF-8 с BOM)
 * - Валидацией входных данных
 * - Автоматическим скачиванием
 * 
 * @param data - массив данных документов для экспорта
 * @param fields - массив описаний полей отчёта
 * @param selectedFieldKeys - ключи выбранных полей для экспорта
 * @param fileName - базовое имя файла (опционально)
 */
export const exportDocumentsToCSV = (
  data: DocumentData[],
  fields: ReportField[],
  selectedFieldKeys: string[],
  fileName?: string
): { fileName: string; rowsCount: number; columnsCount: number; exportedFields: string[] } | void => {
  // Валидация входных данных
  if (!data || data.length === 0) {
    throw new Error('Нет данных документов для экспорта');
  }
  
  if (!selectedFieldKeys || selectedFieldKeys.length === 0) {
    throw new Error('Не выбраны поля для экспорта');
  }
  
  console.log(`Начинаем экспорт ${data.length} документов с полями: ${selectedFieldKeys.join(', ')}`);
  
  try {
    // Создаём заголовки CSV
    const headers = createCSVHeaders(fields, selectedFieldKeys);
    
    // Формируем начало CSV-файла
    let csvContent = headers.join(',') + '\n';
    
    // Добавляем данные каждого документа
    data.forEach((document, index) => {
      const rowData = createCSVRow(document, selectedFieldKeys);
      csvContent += rowData + '\n';
      
      // Логируем прогресс для больших объёмов данных
      if ((index + 1) % 100 === 0) {
        console.log(`Обработано ${index + 1} из ${data.length} документов`);
      }
    });
    
    // Создаём финальный CSV с BOM для корректного отображения русского текста
    const csvContentWithBOM = createUTF8BOM() + csvContent;
    
    // Создаём Blob и запускаем скачивание
    const blob = createCSVBlob(csvContentWithBOM);
    const finalFileName = generateFileName(fileName);
    
    downloadCSV(blob, finalFileName);
    
    console.log(`✅ Экспорт завершён: файл "${finalFileName}" с ${data.length} строками данных`);
    
    // Возвращаем статистику для пользовательского интерфейса
    const result = {
      fileName: finalFileName,
      rowsCount: data.length,
      columnsCount: selectedFieldKeys.length,
      exportedFields: fields.filter(f => selectedFieldKeys.includes(f.key)).map(f => f.label)
    };
    
    return result;
    
  } catch (error) {
    console.error('Ошибка при экспорте CSV:', error);
    throw error;
  }
};

/**
 * Предустановленные шаблоны полей для быстрого выбора
 */
export const FIELD_TEMPLATES = {
  basic: ['fileName', 'processingDate', 'fileSize', 'status'],
  archiveAttributes: ['archiveId', 'fund', 'opis', 'delo', 'fio', 'date', 'documentNumber'],
  docAttributes: ['fio', 'date', 'documentNumber', 'address', 'organization'],
  fullText: ['fileName', 'recognizedText', 'processingDate'],
  archiveFull: ['archiveCode', 'archiveId', 'fund', 'opis', 'delo', 'fio', 'date', 'documentNumber', 'fileName'],
  newFormatArchival: ['archiveId', 'fund', 'opis', 'delo', 'fileName', 'fio', 'date']
} as const;

/**
 * Проверяет совместимость браузера для экспорта CSV
 * 
 * @returns true если браузер поддерживает необходимые функции
 */
export const checkBrowserSupport = (): boolean => {
  return typeof window !== 'undefined' && 
         'Blob' in window && 
         'URL' in window && 
         'createObjectURL' in URL;
};

/**
 * Получает информацию о доступности функций экспорта
 * 
 * @returns объект с информацией о поддержке функций
 */
export const getExportCapabilities = () => {
  return {
    browserSupport: checkBrowserSupport(),
    canCreateBlob: typeof Blob !== 'undefined',
    canCreateURL: typeof URL !== 'undefined' && 'createObjectURL' in URL,
    recommended: checkBrowserSupport()
  };
};
