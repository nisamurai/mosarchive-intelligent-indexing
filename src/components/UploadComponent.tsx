import React, { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Интерфейс для файла с дополнительной информацией
interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
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
        
        // Обновляем прогресс файла
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: 100, status: 'completed' as const } : f
        ));

        // Небольшая задержка для демонстрации прогресса
        await new Promise(resolve => setTimeout(resolve, 500));
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
                    {fileWithProgress.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                {/* Кнопка удаления */}
                {!isUploading && (
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
                <span>Загрузка файлов...</span>
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
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
