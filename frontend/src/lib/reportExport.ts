import { 
  DocumentRecognitionResult, 
  ReportConfiguration, 
  ReportExportResult 
} from '../types/report';
import { 
  escapeCSVValue, 
  createUTF8BOM, 
  createCSVBlob, 
  generateFileName, 
  downloadCSV 
} from './csvExport';

/**
 * Извлекает значение поля из документа для экспорта
 */
export const getFieldValue = (document: DocumentRecognitionResult, fieldKey: string): string => {
  switch (fieldKey) {
    case 'archiveCode':
      return document.archiveCode?.fullCode || '';
    
    case 'archiveId':
      return document.archiveCode?.archiveId || '';
    
    case 'fund':
      return document.archiveCode?.fund || '';
    
    case 'signature':
      return document.archiveCode?.signature || '';
    
    case 'caseNumber':
      return document.archiveCode?.caseNumber || '';
    
    case 'fullText':
      return document.fullText || '';
    
    case 'fio':
      return document.attributes?.find(a => a.type === 'fio')?.value || '';
    
    case 'date':
      return document.attributes?.find(a => a.type === 'date')?.value || '';
    
    case 'address':
      return document.attributes?.find(a => a.type === 'address')?.value || '';
    
    case 'organization':
      return document.attributes?.find(a => a.type === 'organization')?.value || '';
    
    case 'documentNumber':
      return document.attributes?.find(a => a.type === 'documentNumber')?.value || '';
    
    case 'fileName':
      return document.pageInfo?.fileName || '';
    
    case 'pageNumber':
      return document.pageInfo?.pageNumber?.toString() || '';
    
    case 'imageNumber':
      return document.pageInfo?.imageNumber || '';
    
    case 'processingDate':
      return document.processingDate?.toLocaleString('ru-RU') || '';
    
    default:
      return '';
  }
};

/**
 * Создаёт заголовки CSV из выбранных полей
 */
export const createReportHeaders = (selectedFields: string[]): string[] => {
  const fieldLabels: Record<string, string> = {
    archiveCode: 'Архивный шифр',
    archiveId: 'Номер архива',
    fund: 'Фонд',
    signature: 'Подпись',
    caseNumber: 'Дело',
    fullText: 'Полный текст документа',
    fio: 'ФИО',
    date: 'Дата',
    address: 'Адрес',
    organization: 'Организация',
    documentNumber: 'Номер документа',
    fileName: 'Имя файла',
    pageNumber: 'Номер страницы',
    imageNumber: 'Номер образа',
    processingDate: 'Дата обработки'
  };

  return selectedFields.map(fieldKey => 
    escapeCSVValue(fieldLabels[fieldKey] || fieldKey)
  );
};

/**
 * Создаёт строку CSV из документа
 */
export const createReportRow = (
  document: DocumentRecognitionResult, 
  selectedFields: string[]
): string => {
  const rowValues = selectedFields.map(fieldKey => {
    const value = getFieldValue(document, fieldKey);
    return escapeCSVValue(value);
  });
  
  return rowValues.join(',');
};

/**
 * Экспортирует отчёт в CSV формат
 */
export const exportReportToCSV = (
  documents: DocumentRecognitionResult[],
  config: ReportConfiguration
): ReportExportResult => {
  if (!documents || documents.length === 0) {
    throw new Error('Нет данных документов для экспорта');
  }
  
  if (!config.selectedFields || config.selectedFields.length === 0) {
    throw new Error('Не выбраны поля для экспорта');
  }

  console.log(`Начинаем экспорт ${documents.length} документов с полями: ${config.selectedFields.join(', ')}`);

  try {
    // Создаём заголовки CSV
    const headers = createReportHeaders(config.selectedFields);
    
    // Формируем начало CSV-файла
    let csvContent = headers.join(',') + '\n';
    
    // Добавляем данные каждого документа
    documents.forEach((document, index) => {
      const rowData = createReportRow(document, config.selectedFields);
      csvContent += rowData + '\n';
      
      // Логируем прогресс для больших объёмов данных
      if ((index + 1) % 100 === 0) {
        console.log(`Обработано ${index + 1} из ${documents.length} документов`);
      }
    });
    
    // Создаём финальный CSV с BOM для корректного отображения русского текста
    const csvContentWithBOM = createUTF8BOM() + csvContent;
    
    // Создаём Blob и запускаем скачивание
    const blob = createCSVBlob(csvContentWithBOM);
    const fileName = generateFileName('archive_report');
    
    downloadCSV(blob, fileName);
    
    console.log(`✅ Экспорт завершён: файл "${fileName}" с ${documents.length} строками данных`);
    
    // Возвращаем результат
    const result: ReportExportResult = {
      fileName,
      format: 'csv',
      recordsCount: documents.length,
      fieldsCount: config.selectedFields.length,
      fileSize: blob.size,
      exportDate: new Date()
    };
    
    return result;
    
  } catch (error) {
    console.error('Ошибка при экспорте отчёта:', error);
    throw error;
  }
};

/**
 * Создаёт моковые данные для демонстрации
 */
export const createMockDocuments = (): DocumentRecognitionResult[] => {
  return [
    {
      archiveCode: {
        archiveId: '01',
        fund: '0203',
        signature: '0745',
        caseNumber: '000002',
        fullCode: '01-0203-0745-000002'
      },
      pageInfo: {
        fileName: '01-0203-0745-000002_00000001.jpg',
        pageNumber: 1,
        filePath: '01-0203-0745-000002/01-0203-0745-000002_00000001.jpg',
        imageNumber: '00000001'
      },
      recognitionType: 'attribute',
      attributes: [
        { type: 'fio', value: 'Иванов Иван Иванович', confidence: 0.95 },
        { type: 'date', value: '15.03.1960', confidence: 0.98 },
        { type: 'address', value: 'г. Москва, ул. Ленина, д. 10', confidence: 0.87 },
        { type: 'organization', value: 'Московский архив', confidence: 0.92 }
      ],
      processingDate: new Date(),
      confidence: 0.93
    },
    {
      archiveCode: {
        archiveId: '01',
        fund: '0203',
        signature: '0745',
        caseNumber: '000002',
        fullCode: '01-0203-0745-000002'
      },
      pageInfo: {
        fileName: '01-0203-0745-000002_00000002.jpg',
        pageNumber: 2,
        filePath: '01-0203-0745-000002/01-0203-0745-000002_00000002.jpg',
        imageNumber: '00000002'
      },
      recognitionType: 'full',
      fullText: 'Документ содержит полный текст распознавания. Здесь может быть любой текст, который был извлечён из документа с помощью OCR технологий.',
      processingDate: new Date(),
      confidence: 0.89
    },
    {
      archiveCode: {
        archiveId: '02',
        fund: '0105',
        signature: '1234',
        caseNumber: '000001',
        fullCode: '02-0105-1234-000001'
      },
      pageInfo: {
        fileName: '02-0105-1234-000001_00000001.jpg',
        pageNumber: 1,
        filePath: '02-0105-1234-000001/02-0105-1234-000001_00000001.jpg',
        imageNumber: '00000001'
      },
      recognitionType: 'attribute',
      attributes: [
        { type: 'fio', value: 'Петров Петр Петрович', confidence: 0.96 },
        { type: 'date', value: '22.07.1955', confidence: 0.94 },
        { type: 'documentNumber', value: 'А-123456', confidence: 0.91 }
      ],
      processingDate: new Date(),
      confidence: 0.94
    }
  ];
};
