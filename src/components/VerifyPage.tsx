import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Save, ZoomIn, ZoomOut, RotateCw, Download, Check, X, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';

// Интерфейсы для компонента верификации
interface VerifyPageProps {
  imageUrl: string;
  recognizedText: string;
  fileName?: string;
  onSave?: (editedText: string) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

interface TextValidationInfo {
  hasChanges: boolean;
  originalLength: number;
  editedLength: number;
  validationErrors: string[];
}

// Компонент для выделения измененного текста
const HighlightedText: React.FC<{
  originalText: string;
  editedText: string;
  className?: string;
}> = ({ originalText, editedText, className }) => {
  // Простая функция для выделения различий между текстами
  const createHighlightedText = () => {
    if (originalText === editedText) {
      return <span className="text-gray-700">{editedText}</span>;
    }

    const originalLines = originalText.split('\n');
    const editedLines = editedText.split('\n');
    
    return editedLines.map((line, lineIndex) => {
      const originalLine = originalLines[lineIndex] || '';
      
      if (line === originalLine) {
        return (
          <div key={lineIndex} className="mb-1">
            <span className="text-gray-700">{line}</span>
          </div>
        );
      }

      // Простое выделение измененных строк
      return (
        <div key={lineIndex} className="mb-1">
          <span className="text-gray-700 bg-yellow-100 px-1 rounded">
            {line}
          </span>
        </div>
      );
    });
  };

  return (
    <div className={cn("font-mono text-sm leading-relaxed", className)}>
      {createHighlightedText()}
    </div>
  );
};

// Компонент для панели инструментов изображения
const ImageToolbar: React.FC<{
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onDownload: () => void;
  zoomLevel: number;
  className?: string;
}> = ({ onZoomIn, onZoomOut, onRotate, onDownload, zoomLevel, className }) => {
  return (
    <div className={cn("flex items-center justify-between bg-white border-b px-4 py-2", className)}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Инструменты:</span>
        
        <button
          onClick={onZoomOut}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Уменьшить"
          aria-label="Уменьшить изображение"
        >
          <ZoomOut className="w-4 h-4 text-gray-600" />
        </button>
        
        <span className="text-sm text-gray-600 min-w-[50px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        
        <button
          onClick={onZoomIn}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Увеличить"
          aria-label="Увеличить изображение"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={onRotate}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors ml-2"
          title="Повернуть"
          aria-label="Повернуть изображение"
        >
          <RotateCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <button
        onClick={onDownload}
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        title="Скачать изображение"
        aria-label="Скачать изображение"
      >
        <Download className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};

// Основной компонент VerifyPage
export const VerifyPage: React.FC<VerifyPageProps> = ({
  imageUrl,
  recognizedText,
  fileName = 'документ',
  onSave,
  onCancel,
  className
}) => {
  // Состояние компонента
  const [editedText, setEditedText] = useState(recognizedText);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotate, setImageRotate] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationInfo, setValidationInfo] = useState<TextValidationInfo>({
    hasChanges: false,
    originalLength: recognizedText.length,
    editedLength: recognizedText.length,
    validationErrors: []
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Валидация текста при изменении
  const validateText = useCallback((text: string): TextValidationInfo => {
    const hasChanges = text !== recognizedText;
    const editedLength = text.length;
    const validationErrors: string[] = [];

    // Простые валидационные правила
    if (text.trim().length === 0) {
      validationErrors.push('Текст не может быть пустым');
    }

    if (editedLength < recognizedText.length * 0.5) {
      validationErrors.push('Текст стал значительно короче оригинала');
    }

    if (editedLength > recognizedText.length * 2) {
      validationErrors.push('Текст стал значительно длиннее оригинала');
    }

    return {
      hasChanges,
      originalLength: recognizedText.length,
      editedLength,
      validationErrors
    };
  }, [recognizedText]);

  // Обновляем валидацию при изменении текста
  useEffect(() => {
    setValidationInfo(validateText(editedText));
  }, [editedText, validateText]);

  // Обработчики масштабирования изображения
  const handleZoomIn = useCallback(() => {
    setImageZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setImageZoom(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setImageRotate(prev => (prev + 90) % 360);
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании изображения:', error);
    }
  }, [imageUrl, fileName]);

  // Обработчик изменения текста
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  }, []);
  
  // Обработчик сохранения
  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(editedText);
      setIsEditing(false);
      // Обновляем исходный текст после успешного сохранения
      const newValidationInfo = validateText(editedText);
      setValidationInfo({ ...newValidationInfo, hasChanges: false });
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчик отмены изменений
  const handleCancel = useCallback(() => {
    setEditedText(recognizedText);
    setIsEditing(false);
  }, [recognizedText]);

  // Обработчик начала редактирования
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    // Фокусируемся на текстовое поле после небольшой задержки
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(0, 0);
    }, 100);
  }, []);

  // Обработчик сброса масштаба кнопкой мыши колесиком
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  }, [handleZoomIn, handleZoomOut]);

  return (
    <div className={cn("bg-white rounded-lg shadow-lg overflow-hidden", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Верификация результатов распознавания
          </h2>
          <p className="text-sm text-gray-600">
            Документ: {fileName}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {validationInfo.hasChanges && (
            <div className="flex items-center space-x-2 text-sm">
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600">Есть изменения</span>
            </div>
          )}
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Закрыть"
              aria-label="Закрыть верификацию"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Левая панель - изображение */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Панель инструментов изображения */}
          <ImageToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotate={handleRotate}
            onDownload={handleDownload}
            zoomLevel={imageZoom}
            className="flex-shrink-0"
          />
          
          {/* Область просмотра изображения */}
          <div className="flex-1 overflow-auto bg-gray-50 p-4" onWheel={handleWheel}>
            <div className="flex justify-center items-center min-h-full">
              <img
                ref={imageRef}
                src={imageUrl}
                alt={`Изображение документа: ${fileName}`}
                className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
                style={{
                  transform: `scale(${imageZoom}) rotate(${imageRotate}deg)`,
                  transformOrigin: 'center'
                }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          </div>
          
          {/* Информация о масштабе */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-t border-gray-200 text-sm text-gray-500">
            <span>Задержите Ctrl + колесико мыши для масштабирования</span>
            <span>{Math.round(imageZoom * 100)}%</span>
          </div>
        </div>

        {/* Правая панель - текст */}
        <div className="w-1/2 flex flex-col">
          {/* Панель управления текстом */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-700">
                Распознанный текст
              </h3>
              {validationInfo.hasChanges && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Изменен
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || validationInfo.validationErrors.length > 0}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Отмена</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Область редактирования текста */}
          <div className="flex-1 p-4 overflow-hidden">
            {isEditing ? (
              <>
                {/* Редактируемое текстовое поле */}
                <textarea
                  ref={textareaRef}
                  value={editedText}
                  onChange={handleTextChange}
                  className="w-full h-full resize-none border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
                  placeholder="Введите текст..."
                  spellCheck={false}
                />
                
                {/* Валидационные ошибки */}
                {validationInfo.validationErrors.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <ul className="text-xs text-red-700 space-y-1">
                      {validationInfo.validationErrors.map((error, index) => (
                        <li key={index}> {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              /* Режим просмотра с подсветкой изменений */
              <div className="h-full border border-gray-300 rounded-md overflow-auto bg-gray-50 p-3">
                <HighlightedText
                  originalText={recognizedText}
                  editedText={editedText}
                  className="h-full"
                />
              </div>
            )}
          </div>
          
          {/* Информация о тексте */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>
                  Исходный: {validationInfo.originalLength} симв.
                </span>
                <span>
                  Текущий: {validationInfo.editedLength} симв.
                </span>
                {validationInfo.hasChanges && (
                  <span className="text-amber-600">
                    Изменений: {Math.abs(validationInfo.editedLength - validationInfo.originalLength)}
                  </span>
                )}
              </div>
              
              <span>
                {isEditing ? 'Режим редактирования' : 'Режим просмотра'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Статус синхронизации состояния */}
      <div className="bg-blue-50 px-6 py-3 border-t border-blue-200">
        <div className="flex items-center space-x-2">
          <Check className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            Состояние синхронизировано: {validationInfo.hasChanges ? 'изменения не сохранены' : 'сохранено'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
