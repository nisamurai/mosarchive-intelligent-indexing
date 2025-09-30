/**
 * Адаптер данных документов для конструктора отчётов
 * 
 * Этот модуль содержит функции для преобразования данных из различных
 * источников в единый формат DocumentData для использования в отчётах.
 */

import { ExtractedAttributes } from '../components/UploadComponent';

// Базовый интерфейс документа из UploadComponent
export interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'text_recognition' | 'attribute_extraction' | 'completed' | 'error';
  error?: string;
  processingStep?: string;
  processingLog?: string[];
  recognizedText?: string;
  textRecognitionProgress?: number;
  extractedAttributes?: ExtractedAttributes;
  attributeExtractionProgress?: number;
}

// Интерфейс документа из App.tsx
export interface ProcessedFile {
  file: File;
  recognizedText?: string;
  processingStatus: 'completed' | 'error';
  processedAt: Date;
}

// Единый интерфейс данных документа для отчётов
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
  fileId?: string;
  progress?: number;
}

/**
 * Извлекает архивную информацию из строки архивного кода
 * 
 * Функция парсит различные форматы архивных кодов:
 * 1. Архивный формат: "01-0203-0745-000002" (архив-фонд-опись-дело)
 * 2. Старый формат: "Фонд 10, опись 5, дело 20"
 * 3. Краткий формат: "Ф.5, Оп.1, Д.12"
 * 
 * @param archiveCodeString - строка архивного кода
 * @returns объект с числовыми значениями
 * 
 * Примеры:
 * "01-0203-0745-000002" -> { archiveId: 1, fund: 203, opis: 745, delo: 2 }
 * "Фонд 10, опись 5, дело 20" -> { fund: 10, opis: 5, delo: 20 }
 * "Ф.5, Оп.1, Д.12" -> { fund: 5, opis: 1, delo: 12 }
 */
export const parseArchiveCode = (archiveCodeString: string): { 
  archiveId?: number, 
  fund?: number, 
  opis?: number, 
  delo?: number 
} => {
  if (!archiveCodeString) return {};
  
  try {
    const result: { 
      archiveId?: number, 
      fund?: number, 
      opis?: number, 
      delo?: number 
    } = {};
    
    // Проверяем архивный формат: XX-XXXX-XXXX-XXXXXX (архив-фонд-опись-дело)
    const newFormatPattern = /^(\d{2})-(\d{4})-(\d{4})-(\d{6})$/;
    const newFormatMatch = archiveCodeString.trim().match(newFormatPattern);
    
    if (newFormatMatch) {
      result.archiveId = parseInt(newFormatMatch[1], 10);
      result.fund = parseInt(newFormatMatch[2], 10);
      result.opis = parseInt(newFormatMatch[3], 10);
      result.delo = parseInt(newFormatMatch[4], 10); // 6-значный номер дела
      return result;
    }
    
    // Паттерны для старого формата
    const fundPattern = /фонд[\s:]*(\d+)|ф\.?\s*(\d+)/i;
    const opisPattern = /опись[\s:]*(\d+)|оп\.?\s*(\d+)/i;
    const deloPattern = /дело[\s:]*(\d+)|д\.?\s*(\d+)|дело\s*№?\s*(\d+)/i;
    
    // Ищем номер фонда
    const fundMatch = archiveCodeString.match(fundPattern);
    if (fundMatch) {
      result.fund = parseInt((fundMatch[1] || fundMatch[2]), 10);
    }
    
    // Ищем номер описи
    const opisMatch = archiveCodeString.match(opisPattern);
    if (opisMatch) {
      result.opis = parseInt((opisMatch[1] || opisMatch[2]), 10);
    }
    
    // Ищем номер дела
    const deloMatch = archiveCodeString.match(deloPattern);
    if (deloMatch) {
      result.delo = parseInt((deloMatch[1] || deloMatch[2] || deloMatch[3]), 10);
    }
    
    return result;
  } catch (error) {
    console.warn('Ошибка при парсинге архивного кода:', archiveCodeString, error);
    return {};
  }
};

/**
 * Преобразует данные из UploadComponent в формат DocumentData
 * 
 * @param fileWithProgress - объект файла с прогрессом обработки
 * @returns объект DocumentData для отчёта
 */
export const adaptFileWithProgress = (fileWithProgress: FileWithProgress): DocumentData => {
  const file = fileWithProgress.file;
  const attributes = fileWithProgress.extractedAttributes;
  
  // Извлекаем архивную информацию из кода
  const archiveInfo = attributes?.archive_code 
    ? parseArchiveCode(attributes.archive_code)
    : {};
  
  // Определяем статус на основе progress и error
  let status = 'Обрабатывается';
  if (fileWithProgress.status === 'completed') {
    status = 'Обработан';
  } else if (fileWithProgress.status === 'error') {
    status = 'Ошибка обработки';
  } else if (fileWithProgress.status === 'processing') {
    status = 'Обрабатывается';
  }
  
  return {
    fileName: file.name,
    archiveCode: attributes?.archive_code || '',
    recognizedText: fileWithProgress.recognizedText || '',
    archiveId: archiveInfo.archiveId,
    fund: archiveInfo.fund,
    opis: archiveInfo.opis,
    delo: archiveInfo.delo,
    fio: attributes?.fio || '',
    date: attributes?.date || '',
    documentNumber: attributes?.document_number || '',
    address: attributes?.address || '',
    organization: attributes?.organization || '',
    processingDate: new Date().toLocaleString('ru-RU'),
    fileSize: file.size,
    status,
    fileId: fileWithProgress.id,
    progress: fileWithProgress.progress
  };
};

/**
 * Преобразует данные к App.tsx в формат DocumentData
 * 
 * @param processedFile - объект обработанного файла
 * @returns объект DocumentData для отчёта
 */
export const adaptProcessedFile = (processedFile: ProcessedFile): DocumentData => {
  // Определяем статус обработки
  let status = 'Обработан';
  if (processedFile.processingStatus === 'error') {
    status = 'Ошибка обработки';
  }
  
  return {
    fileName: processedFile.file.name,
    recognizedText: processedFile.recognizedText || '',
    processingDate: processedFile.processedAt.toLocaleString('ru-RU'),
    fileSize: processedFile.file.size,
    status
  };
};

/**
 * Создаёт тестовые данные для демонстрации функций отчётности
 * 
 * @param count - количество тестовых документов
 * @returns массив тестовых объектов DocumentData
 */
export const createSampleData = (count: number = 5): DocumentData[] => {
  const sampleNames = [
    'Заявление о предоставлении архивной справки.pdf',
    'Документ о гражданском состоянии.tiff',
    'Письмо директора архива.jpg',
    'Выписка из книги по гражданству.djvu',
    'Справка о составе семьи.pdf',
    'Акт об отсутствии документов.jpg',
    'Метрическая запись.tiff',
    'Свидетельство о браке.pdf',
    'Выписка из реестра.jpg',
    'Исковое заявление.djvu'
  ];
  
  const sampleFIOs = [
    'Иванов Иван Иванович',
    'Петрова Анна Сергеевна',
    'Сидоров Кирилл Владимирович',
    'Козлова Мария Александровна',
    'Волков Дмитрий Павлович',
    'Соколова Елена Николаевна',
    'Лебедев Андрей Викторович',
    'Зайцева Ольга Романовна',
    'Морозов Сергей Алексеевич',
    'Виноградова Татьяна Дмитриевна'
  ];
  
  const sampleDates = [
    '15.03.1924',
    '22.07.1941',
    '03.11.1952',
    '18.09.1967',
    '26.12.1978',
    '08.04.1985',
    '14.10.1993',
    '31.01.2001',
    '12.06.2009',
    '27.11.2018'
  ];
  
  const sampleDocumentsNumbers = [
    '№ 12345',
    'акт-156',
    'письмо-А-89',
    'справка 456',
    'выписка № 789',
    'документ 123/45',
    'акт № 67',
    'справка А-891',
    'письмо Б-234',
    'выписка 567-8'
  ];
  
  const sampleArchiveCodes = [
    '01-0203-0745-000002',  // Архивный формат: архив 01, фонд 203, опись 745, дело 2
    '02-1545-0321-000045',  // архив 02, фонд 1545, опись 321, дело 45
    '03-0890-0156-000123',  // архив 03, фонд 890, опись 156, дело 123
    'Фонд 10, опись 5, дело 20',  // Старый формат
    'Ф.45, Оп.12, Д.89',    // Краткий формат
    '04-2400-0888-000999',  // архив 04, фонд 2400, опись 888, дело 999
    '05-0123-0456-000001',  // архив 05, фонд 123, опись 456, дело 1
    'Ф.12, Оп.3, Д.45',     // Краткий формат
    '06-0987-0654-000777',  // архив 06, фонд 987, опись 654, дело 777
    '07-0123-0456-000888'   // архив 07, фонд 123, опись 456, дело 888
  ];
  
  const result: DocumentData[] = [];
  
  for (let i = 0; i < count; i++) {
    const archiveInfo = parseArchiveCode(sampleArchiveCodes[i % sampleArchiveCodes.length]);
    
    result.push({
      fileName: sampleNames[i % sampleNames.length],
      archiveCode: sampleArchiveCodes[i % sampleArchiveCodes.length],
      recognizedText: `Пример распознанного текста документа № ${i + 1}:\n\nОсновной текст документа с подробным описанием содержимого. Текст может содержать различные данные и информацию.`,
      archiveId: archiveInfo.archiveId,
      fund: archiveInfo.fund,
      opis: archiveInfo.opis,
      delo: archiveInfo.delo,
      fio: sampleFIOs[i % sampleFIOs.length],
      date: sampleDates[i % sampleDates.length],
      documentNumber: sampleDocumentsNumbers[i % sampleDocumentsNumbers.length],
      address: i % 3 === 0 ? 'г. Москва, ул. Тверская, д. 12' : i % 3 === 1 ? 'г. Санкт-Петербург, Невский пр-т, д. 45' : 'г. Екатеринбург, ул. Ленина, д. 78',
      organization: i % 2 === 0 ? 'Государственный архив Российской Федерации' : 'Архивный отдел администрации города',
      processingDate: new Date(Date.now() - i * 60000).toLocaleString('ru-RU'),
      fileSize: Math.floor(Math.random() * 5000000) + 1000000, // от 1MB до 6MB
      status: i % 10 === 0 ? 'Ошибка обработки' : 'Обработан'
    });
  }
  
  return result;
};

/**
 * Расширяет данные документа дополнительной информацией
 * 
 * @param document - базовые данные документа
 * @param additionalData - дополнительные поля
 * @returns расширенные данные документа
 */
export const extendDocumentData = (
  document: DocumentData, 
  additionalData: Partial<DocumentData>
): DocumentData => {
  return {
    ...document,
    ...additionalData
  };
};

/**
 * Фильтрует список документов по заданным критериям
 * 
 * @param documents - массив документов для фильтрации
 * @param filters - критерии фильтрации
 * @returns отфильтрованный массив документов
 */
export const filterDocuments = (
  documents: DocumentData[],
  filters: {
    status?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    fund?: number[];
    archiveId?: number[];
    fileName?: string;
  }
): DocumentData[] => {
  return documents.filter(doc => {
    // Фильтр по статусу
    if (filters.status && filters.status.length > 0) {
      if (!doc.status || !filters.status.includes(doc.status)) {
        return false;
      }
    }
    
    // Фильтр по дате
    if (filters.dateFrom || filters.dateTo) {
      const docDate = new Date(doc.processingDate || '');
      if (filters.dateFrom && docDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && docDate > filters.dateTo) {
        return false;
      }
    }
    
    // Фильтр по фонду
    if (filters.fund && filters.fund.length > 0) {
      if (!doc.fund || !filters.fund.includes(doc.fund)) {
        return false;
      }
    }
    
    // Фильтр по архивному ID
    if (filters.archiveId && filters.archiveId.length > 0) {
      if (!doc.archiveId || !filters.archiveId.includes(doc.archiveId)) {
        return false;
      }
    }
    
    // Фильтр по имени файла (частичное совпадение)
    if (filters.fileName) {
      if (!doc.fileName || !doc.fileName.toLowerCase().includes(filters.fileName.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Сортирует документы по заданному критерию
 * 
 * @param documents - массив документов для сортировки
 * @param sortBy - поле для сортировки
 * @param direction - направление сортировки
 * @returns отсортированный массив документов
 */
export const sortDocuments = (
  documents: DocumentData[],
  sortBy: keyof DocumentData,
  direction: 'asc' | 'desc' = 'asc'
): DocumentData[] => {
  return [...documents].sort((a, b) => {
    const valueА = a[sortBy];
    const valueБ = b[sortBy];
    
    // Определяем порядок сортировки
    const order = direction === 'asc' ? 1 : -1;
    
    // Обрабатываем различные типы данных
    if (valueА === undefined && valueБ === undefined) return 0;
    if (valueА === undefined) return order;
    if (valueБ === undefined) return -order;
    
    // Строковая сортировка
    if (typeof valueА === 'string' && typeof valueБ === 'string') {
      return valueА.localeCompare(valueБ, 'ru') * order;
    }
    
    // Числовая сортировка
    if (typeof valueА === 'number' && typeof valueБ === 'number') {
      return (valueА - valueБ) * order;
    }
    
    // Сортировка по дате (если значения можно преобразовать в Date)
    const dateА = new Date(String(valueА));
    const dateБ = new Date(String(valueБ));
    
    if (!isNaN(dateА.getTime()) && !isNaN(dateБ.getTime())) {
      return (dateА.getTime() - dateБ.getTime()) * order;
    }
    
    // Fallback: строковое сравнение
    return String(valueА).localeCompare(String(valueБ), 'ru') * order;
  });
};

/**
 * Получает статистику по коллекции документов
 * 
 * @param documents - массив документов
 * @returns объект со статистикой
 */
export const getDocumentStats = (documents: DocumentData[]) => {
  const stats = {
    total: documents.length,
    byStatus: {} as Record<string, number>,
    byFond: {} as Record<string, number>,
    byArchiveId: {} as Record<string, number>,
    totalSize: 0,
    dateRange: { earliest: '', latest: '' } as { earliest: string, latest: string },
    hasErrors: 0,
    processed: 0
  };
  
  if (documents.length === 0) {
    return stats;
  }
  
  let earliestDate = new Date();
  let latestDate = new Date(0);
  
  documents.forEach(doc => {
    // Статистика по статусу
    if (doc.status) {
      stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
      
      if (doc.status === 'Ошибка обработки') {
        stats.hasErrors++;
      } else if ( doc.status === 'Обработан') {
        stats.processed++;
      }
    }
    
    // Статистика по фонду
    if (doc.fund !== undefined) {
      const fundKey = `Фонд ${doc.fund}`;
      stats.byFond[fundKey] = (stats.byFond[fundKey] || 0) + 1;
    }
    
    // Статистика по архивному ID
    if (doc.archiveId !== undefined) {
      const archiveKey = `Архив ${doc.archiveId}`;
      stats.byArchiveId[archiveKey] = (stats.byArchiveId[archiveKey] || 0) + 1;
    }
    
    // Общий размер файлов
    if (doc.fileSize) {
      stats.totalSize += doc.fileSize;
    }
    
    // Диапазон дат
    if (doc.processingDate) {
      const docDate = new Date(doc.processingDate);
      if (docDate < earliestDate) {
        earliestDate = docDate;
      }
      if (docDate > latestDate) {
        latestDate = docDate;
      }
    }
  });
  
  stats.dateRange.earliest = earliestDate.toLocaleString('ru-RU');
  stats.dateRange.latest = latestDate.toLocaleString('ru-RU');
  
  return stats;
};
