import { ArchiveCode } from '../types/report';

/**
 * Парсит архивный шифр из строки формата "01-0203-0745-000002"
 * @param archiveCodeString - строка с архивным шифром
 * @returns объект ArchiveCode или null если формат неверный
 */
export const parseArchiveCode = (archiveCodeString: string): ArchiveCode | null => {
  if (!archiveCodeString || typeof archiveCodeString !== 'string') {
    return null;
  }

  // Убираем пробелы и приводим к верхнему регистру
  const cleanCode = archiveCodeString.trim().toUpperCase();
  
  // Проверяем формат: XX-XXXX-XXXX-XXXXXX
  const archiveCodeRegex = /^(\d{2})-(\d{4})-(\d{4})-(\d{6})$/;
  const match = cleanCode.match(archiveCodeRegex);
  
  if (!match) {
    return null;
  }

  const [, archiveId, fund, signature, caseNumber] = match;
  
  return {
    archiveId,
    fund,
    signature,
    caseNumber,
    fullCode: cleanCode
  };
};

/**
 * Формирует архивный шифр из компонентов
 * @param components - компоненты архивного шифра
 * @returns строка с архивным шифром
 */
export const formatArchiveCode = (components: {
  archiveId: string;
  fund: string;
  signature: string;
  caseNumber: string;
}): string => {
  const { archiveId, fund, signature, caseNumber } = components;
  
  // Проверяем формат каждого компонента
  if (!/^\d{2}$/.test(archiveId)) {
    throw new Error('Номер архива должен содержать 2 цифры');
  }
  if (!/^\d{4}$/.test(fund)) {
    throw new Error('Номер фонда должен содержать 4 цифры');
  }
  if (!/^\d{4}$/.test(signature)) {
    throw new Error('Номер подписи должен содержать 4 цифры');
  }
  if (!/^\d{6}$/.test(caseNumber)) {
    throw new Error('Номер дела должен содержать 6 цифр');
  }
  
  return `${archiveId}-${fund}-${signature}-${caseNumber}`;
};

/**
 * Валидирует архивный шифр
 * @param archiveCodeString - строка с архивным шифром
 * @returns true если шифр валидный
 */
export const validateArchiveCode = (archiveCodeString: string): boolean => {
  return parseArchiveCode(archiveCodeString) !== null;
};

/**
 * Извлекает архивный шифр из имени файла или пути
 * @param fileName - имя файла или путь
 * @returns архивный шифр или null
 */
export const extractArchiveCodeFromPath = (fileName: string): ArchiveCode | null => {
  if (!fileName) return null;
  
  // Ищем паттерн архивного шифра в пути
  const archiveCodeRegex = /(\d{2}-\d{4}-\d{4}-\d{6})/;
  const match = fileName.match(archiveCodeRegex);
  
  if (match) {
    return parseArchiveCode(match[1]);
  }
  
  return null;
};

/**
 * Генерирует 8-значный номер образа из имени файла
 * @param fileName - имя файла
 * @returns 8-значный номер образа
 */
export const extractImageNumber = (fileName: string): string => {
  if (!fileName) return '';
  
  // Ищем 8-значное число в имени файла
  const imageNumberRegex = /(\d{8})/;
  const match = fileName.match(imageNumberRegex);
  
  return match ? match[1] : '';
};

/**
 * Создаёт информацию о странице документа
 * @param fileName - имя файла
 * @param archiveCode - архивный шифр
 * @returns информация о странице
 */
export const createDocumentPageInfo = (
  fileName: string, 
  archiveCode?: ArchiveCode
): {
  fileName: string;
  pageNumber: number;
  filePath: string;
  imageNumber: string;
} => {
  const imageNumber = extractImageNumber(fileName);
  const pageNumber = imageNumber ? parseInt(imageNumber, 10) : 0;
  
  return {
    fileName,
    pageNumber,
    filePath: fileName,
    imageNumber
  };
};

/**
 * Группирует документы по архивному шифру
 * @param documents - массив документов с архивными шифрами
 * @returns объект с группировкой по шифрам
 */
export const groupDocumentsByArchiveCode = <T extends { archiveCode?: ArchiveCode }>(
  documents: T[]
): Record<string, T[]> => {
  return documents.reduce((groups, doc) => {
    const archiveKey = doc.archiveCode?.fullCode || 'unknown';
    if (!groups[archiveKey]) {
      groups[archiveKey] = [];
    }
    groups[archiveKey].push(doc);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Сортирует документы по архивному шифру и номеру страницы
 * @param documents - массив документов
 * @returns отсортированный массив
 */
export const sortDocumentsByArchiveAndPage = <T extends { 
  archiveCode?: ArchiveCode; 
  pageInfo?: { pageNumber: number } 
}>(
  documents: T[]
): T[] => {
  return [...documents].sort((a, b) => {
    // Сначала по архивному шифру
    const aCode = a.archiveCode?.fullCode || '';
    const bCode = b.archiveCode?.fullCode || '';
    
    if (aCode !== bCode) {
      return aCode.localeCompare(bCode);
    }
    
    // Затем по номеру страницы
    const aPage = a.pageInfo?.pageNumber || 0;
    const bPage = b.pageInfo?.pageNumber || 0;
    
    return aPage - bPage;
  });
};
