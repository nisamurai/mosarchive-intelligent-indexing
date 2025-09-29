import React, { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Интерфейс для извлеченных атрибутов
export interface ExtractedAttributes {
  fio: string;
  date: string;
  address: string;
  archive_code: string;
  document_number: string;
  organization: string;
}

// Интерфейс для файла с дополнительной информацией
interface FileWithProgress {
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

// Пропсы компонента
interface UploadComponentProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // в байтах
  className?: string;
}

// Поддерживаемые форматы файлов
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/tiff', 'application/pdf'];
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.tiff', '.pdf'];

// Функция для валидации файла
const validateFile = (file: File, maxFileSize?: number): string | null => {
  // Проверка формата файла
  const isValidFormat = SUPPORTED_FORMATS.includes(file.type) || 
    SUPPORTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!isValidFormat) {
    return `Неподдерживаемый формат файла. Поддерживаются: ${SUPPORTED_EXTENSIONS.join(', ')}`;
  }

  // Проверка размера файла
  if (maxFileSize && file.size > maxFileSize) {
    const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
    return `Размер файла превышает ${maxSizeMB}MB`;
  }

  return null;
};

// Функция для генерации уникального ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const UploadComponent: React.FC<UploadComponentProps> = ({
  onUpload,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB по умолчанию
  className
}) => {
  // Состояние компонента
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработчик drag and drop
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  // Обработчик выбора файлов через input
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  }, []);

  // Основная функция обработки файлов
  const handleFiles = useCallback((newFiles: File[]) => {
    setError(null);

    // Проверка количества файлов
    if (files.length + newFiles.length > maxFiles) {
      setError(`Максимальное количество файлов: ${maxFiles}`);
      return;
    }

    const validFiles: FileWithProgress[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      const validationError = validateFile(file, maxFileSize);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push({
          file,
          id: generateId(),
          progress: 0,
          status: 'pending'
        });
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length, maxFiles, maxFileSize]);

  // Обработчик удаления файла
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Симуляция обработки изображения
  const simulateImageProcessing = async (fileId: string) => {
    const processingSteps = [
      'Коррекция перспективы документа...',
      'Выполняется выравнивание изображения...',
      'Повышаем контрастность изображения...',
      'Удаляем шум с изображения...',
      'Выполняется бинаризация изображения...',
      'Улучшаем разрешение изображения...'
    ];

    // Обновляем статус на "обработка"
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'processing' as const,
        processingLog: [],
        progress: 0
      } : f
    ));

    // Симулируем каждый этап обработки
    for (let i = 0; i < processingSteps.length; i++) {
      const step = processingSteps[i];
      const progress = Math.round(((i + 1) / processingSteps.length) * 60); // 60% для обработки изображения
      
      // Обновляем текущий этап и прогресс
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          processingStep: step,
          progress,
          processingLog: [...(f.processingLog || []), `[${i + 1}/${processingSteps.length}] ${step}`]
        } : f
      ));

      // Задержка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Переходим к распознаванию текста
    await simulateTextRecognition(fileId);
  };

  // Симуляция распознавания текста
  const simulateTextRecognition = async (fileId: string) => {
    // Обновляем статус на "распознавание текста"
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'text_recognition' as const,
        processingStep: 'Идёт распознавание текста...',
        textRecognitionProgress: 0
      } : f
    ));

    // Симулируем этапы распознавания текста
    const textRecognitionSteps = [
      'Анализ структуры документа...',
      'Определение областей с текстом...',
      'Распознавание печатного текста...',
      'Распознавание рукописного текста...',
      'Постобработка результата...'
    ];

    for (let i = 0; i < textRecognitionSteps.length; i++) {
      const step = textRecognitionSteps[i];
      const progress = 60 + Math.round(((i + 1) / textRecognitionSteps.length) * 40); // 40% для распознавания текста
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          processingStep: step,
          progress,
          textRecognitionProgress: Math.round(((i + 1) / textRecognitionSteps.length) * 100),
          processingLog: [...(f.processingLog || []), `[Текст] ${step}`]
        } : f
      ));

      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Генерируем пример распознанного текста
    const recognizedText = `Пример распознанного текста из документа ${fileId}:

ДОКУМЕНТ № 12345
Дата: 15.03.2024

ЗАЯВЛЕНИЕ

Я, Иванов Иван Иванович, прошу рассмотреть мой вопрос о предоставлении архивной справки.

Основание: личное обращение гражданина.

Документы прилагаются:
- Копия паспорта
- Заявление

Подпись: _________________ Дата: 15.03.2024

Примечание: Документ содержит как печатный, так и рукописный текст.`;

    // Переходим к извлечению атрибутов
    await simulateAttributeExtraction(fileId, recognizedText);
  };

  // Симуляция извлечения атрибутов
  const simulateAttributeExtraction = async (fileId: string, recognizedText: string) => {
    // Обновляем статус на "извлечение атрибутов"
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'attribute_extraction' as const,
        processingStep: 'Извлекаем атрибуты из текста...',
        attributeExtractionProgress: 0
      } : f
    ));

    // Симулируем этапы извлечения атрибутов
    const attributeExtractionSteps = [
      'Анализ структуры текста...',
      'Поиск ФИО и именованных сущностей...',
      'Извлечение дат и временных меток...',
      'Поиск архивных шифров и кодов...',
      'Валидация извлеченных данных...'
    ];

    for (let i = 0; i < attributeExtractionSteps.length; i++) {
      const step = attributeExtractionSteps[i];
      const progress = 80 + Math.round(((i + 1) / attributeExtractionSteps.length) * 20); // 20% для извлечения атрибутов
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          processingStep: step,
          progress,
          attributeExtractionProgress: Math.round(((i + 1) / attributeExtractionSteps.length) * 100),
          processingLog: [...(f.processingLog || []), `[Атрибуты] ${step}`]
        } : f
      ));

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Генерируем пример извлеченных атрибутов
    const extractedAttributes: ExtractedAttributes = {
      fio: "Иванов Иван Иванович",
      date: "15.03.2024",
      address: "",
      archive_code: "Фонд 10, опись 5, дело 20",
      document_number: "12345",
      organization: ""
    };

    // Завершаем обработку
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'completed' as const,
        progress: 100,
        textRecognitionProgress: 100,
        attributeExtractionProgress: 100,
        processingStep: 'Обработка, распознавание и извлечение атрибутов завершены!',
        recognizedText,
        extractedAttributes
      } : f
    ));
  };

  // Обработчик загрузки файлов
  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      // Обновляем статус файлов на "загружается"
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      // Симуляция загрузки с прогрессом
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Обновляем прогресс загрузки
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: 100 } : f
        ));

        // Небольшая задержка для демонстрации загрузки
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Начинаем обработку изображений
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await simulateImageProcessing(file.id);
      }

      // Вызываем callback с загруженными файлами
      onUpload(files.map(f => f.file));

    } catch (err) {
      setError('Ошибка при загрузке файлов');
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: 'Ошибка загрузки' 
      })));
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload]);

  // Обработчик клика по зоне загрузки
  const handleZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Обработчик клавиатурной навигации
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Зона drag and drop */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragOver 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          isUploading && "pointer-events-none opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Выберите файлы для загрузки"
        aria-describedby="upload-instructions"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.tiff,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <Upload className={cn(
            "w-12 h-12",
            isDragOver ? "text-blue-500" : "text-gray-400"
          )} />
          
          <div id="upload-instructions">
            <p className="text-lg font-medium text-gray-900">
              Перетащите файлы сюда или{' '}
              <span className="text-blue-600 hover:text-blue-500">
                выберите файлы
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Поддерживаемые форматы: JPG, JPEG, TIFF, PDF
            </p>
            <p className="text-sm text-gray-500">
              Максимум {maxFiles} файлов, до {Math.round(maxFileSize / (1024 * 1024))}MB каждый
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Нажмите Enter или Пробел для выбора файлов
            </p>
          </div>
        </div>
      </div>

      {/* Сообщения об ошибках */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-red-700 whitespace-pre-line">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Список выбранных файлов */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium text-gray-900">
            Выбранные файлы ({files.length})
          </h3>
          
          <div className="space-y-2">
            {files.map((fileWithProgress) => (
              <div
                key={fileWithProgress.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileWithProgress.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileWithProgress.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Статус файла */}
                  <div className="flex items-center space-x-2">
                    {fileWithProgress.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {fileWithProgress.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {(fileWithProgress.status === 'uploading' || 
                      fileWithProgress.status === 'processing' || 
                      fileWithProgress.status === 'text_recognition' ||
                      fileWithProgress.status === 'attribute_extraction') && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                {/* Кнопка удаления */}
                {!isUploading && 
                 fileWithProgress.status !== 'processing' && 
                 fileWithProgress.status !== 'text_recognition' &&
                 fileWithProgress.status !== 'attribute_extraction' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileWithProgress.id);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Удалить файл ${fileWithProgress.file.name}`}
                    title={`Удалить файл ${fileWithProgress.file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Прогресс-бар общего прогресса */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Обработка файлов...</span>
                <span>
                  {files.filter(f => f.status === 'completed').length} / {files.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(files.filter(f => f.status === 'completed').length / files.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Детальная информация об обработке */}
          {files.some(f => f.status === 'processing' || f.status === 'text_recognition' || f.status === 'attribute_extraction' || f.processingStep) && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Детали обработки:</h4>
              {files.map((fileWithProgress) => (
                (fileWithProgress.status === 'processing' || fileWithProgress.status === 'text_recognition' || fileWithProgress.status === 'attribute_extraction') && (
                  <div key={fileWithProgress.id} className={`p-3 rounded-lg ${
                    fileWithProgress.status === 'text_recognition' ? 'bg-green-50' : 
                    fileWithProgress.status === 'attribute_extraction' ? 'bg-purple-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        fileWithProgress.status === 'text_recognition' ? 'text-green-900' : 
                        fileWithProgress.status === 'attribute_extraction' ? 'text-purple-900' : 'text-blue-900'
                      }`}>
                        {fileWithProgress.file.name}
                      </span>
                      <span className={`text-xs ${
                        fileWithProgress.status === 'text_recognition' ? 'text-green-600' : 
                        fileWithProgress.status === 'attribute_extraction' ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {fileWithProgress.progress}%
                      </span>
                    </div>
                    
                    {/* Прогресс-бар для отдельного файла */}
                    <div className={`w-full rounded-full h-1.5 mb-2 ${
                      fileWithProgress.status === 'text_recognition' ? 'bg-green-200' : 
                      fileWithProgress.status === 'attribute_extraction' ? 'bg-purple-200' : 'bg-blue-200'
                    }`}>
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          fileWithProgress.status === 'text_recognition' ? 'bg-green-500' : 
                          fileWithProgress.status === 'attribute_extraction' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${fileWithProgress.progress}%` }}
                      />
                    </div>
                    
                    {/* Текущий этап */}
                    {fileWithProgress.processingStep && (
                      <p className={`text-xs ${
                        fileWithProgress.status === 'text_recognition' ? 'text-green-700' : 
                        fileWithProgress.status === 'attribute_extraction' ? 'text-purple-700' : 'text-blue-700'
                      }`}>
                        {fileWithProgress.processingStep}
                      </p>
                    )}
                    
                    {/* Прогресс распознавания текста */}
                    {fileWithProgress.status === 'text_recognition' && fileWithProgress.textRecognitionProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-green-600 mb-1">
                          <span>Распознавание текста</span>
                          <span>{fileWithProgress.textRecognitionProgress}%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${fileWithProgress.textRecognitionProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Прогресс извлечения атрибутов */}
                    {fileWithProgress.status === 'attribute_extraction' && fileWithProgress.attributeExtractionProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-purple-600 mb-1">
                          <span>Извлечение атрибутов</span>
                          <span>{fileWithProgress.attributeExtractionProgress}%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-1">
                          <div
                            className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${fileWithProgress.attributeExtractionProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Лог обработки */}
                    {fileWithProgress.processingLog && fileWithProgress.processingLog.length > 0 && (
                      <div className="mt-2 max-h-20 overflow-y-auto">
                        {fileWithProgress.processingLog.map((logEntry, index) => (
                          <p key={index} className={`text-xs ${
                            fileWithProgress.status === 'text_recognition' ? 'text-green-600' : 
                            fileWithProgress.status === 'attribute_extraction' ? 'text-purple-600' : 'text-blue-600'
                          }`}>
                            {logEntry}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Кнопка загрузки */}
          {!isUploading && files.length > 0 && (
            <button
              onClick={handleUpload}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Загрузить ${files.length} файлов`}
            >
              Загрузить файлы ({files.length})
            </button>
          )}

          {/* Отображение результатов обработки */}
          {files.some(f => f.status === 'completed' && f.extractedAttributes) && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Результаты обработки
              </h3>
              
              {files.map((fileWithProgress) => (
                fileWithProgress.status === 'completed' && fileWithProgress.extractedAttributes && (
                  <div key={fileWithProgress.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {fileWithProgress.file.name}
                      </h4>
                      
                      {/* Извлеченные атрибуты */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {Object.entries(fileWithProgress.extractedAttributes).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {key === 'fio' ? 'ФИО' :
                                 key === 'date' ? 'Дата' :
                                 key === 'address' ? 'Адрес' :
                                 key === 'archive_code' ? 'Архивный шифр' :
                                 key === 'document_number' ? 'Номер документа' :
                                 key === 'organization' ? 'Организация' : key}
                              </span>
                              <span className="text-sm text-gray-900 mt-1 p-2 bg-white rounded border">
                                {value}
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                      
                      {/* Распознанный текст */}
                      {fileWithProgress.recognizedText && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">
                            Распознанный текст:
                          </h5>
                          <div className="text-sm text-gray-700 bg-white p-3 rounded border max-h-40 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans">
                              {fileWithProgress.recognizedText}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
