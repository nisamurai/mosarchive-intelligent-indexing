// Константы приложения
export const APP_CONFIG = {
  name: 'MosArchive',
  description: 'Интеллектуальное индексирование документов',
  version: '1.0.0',
};

export const API_CONFIG = {
  baseUrl: 'http://localhost:8000',
  endpoints: {
    login: '/login',
    register: '/register',
    me: '/me',
    logout: '/logout',
  },
};

export const FILE_CONFIG = {
  maxFiles: 20,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/tiff', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.tiff', '.pdf'],
};

export const PROCESSING_STEPS = [
  { id: 'upload', title: 'Загрузка', description: 'Загрузка документов' },
  { id: 'preprocess', title: 'Предобработка', description: 'Обработка изображений' },
  { id: 'ocr', title: 'OCR', description: 'Распознавание текста' },
  { id: 'verify', title: 'Верификация', description: 'Проверка результатов' },
  { id: 'report', title: 'Отчёт', description: 'Генерация отчёта' },
  { id: 'statistics', title: 'Статистика', description: 'Анализ результатов' },
] as const;

export const ROUTES = {
  login: '/login',
  upload: '/upload',
  preprocess: '/preprocess',
  ocr: '/ocr',
  verify: '/verify',
  report: '/report',
  statistics: '/statistics',
} as const;
