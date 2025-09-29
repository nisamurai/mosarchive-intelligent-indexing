import React, { useState, useMemo } from 'react';
import { Download, FileText, CheckSquare, Square, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { exportDocumentsToCSV, FIELD_TEMPLATES } from '../lib/csvExport';
import type { ReportField, DocumentData } from '../lib/csvExport';

// Определение доступных полей отчёта
const REPORT_FIELDS: ReportField[] = [
  // Базовые поля
  {
    key: 'fileName',
    label: 'Имя файла',
    description: 'Название загруженного файла документа',
    category: 'basic'
  },
  {
    key: 'processingDate',
    label: 'Дата обработки',
    description: 'Дата и время обработки документа',
    category: 'basic'
  },
  {
    key: 'fileSize',
    label: 'Размер файла',
    description: 'Размер файла в мегабайтах',
    category: 'basic'
  },
  {
    key: 'status',
    label: 'Статус',
    description: 'Статус обработки документа',
    category: 'basic'
  },
  {
    key: 'recognizedText',
    label: 'Полный текст документа',
    description: 'Весь распознанный текст документа',
    category: 'text'
  },

  // Архивные атрибуты
  {
    key: 'archiveCode',
    label: 'Архивный шифр',
    description: 'Полный архивный шифр документа',
    category: 'attributes'
  },
  {
    key: 'fund',
    label: 'Фонд',
    description: 'Номер архивного фонда',
    category: 'attributes'
  },
  {
    key: 'opis',
    label: 'Опись',
    description: 'Номер описи',
    category: 'attributes'
  },
  {
    key: 'delo',
    label: 'Дело',
    description: 'Номер дела',
    category: 'attributes'
  },

  // Поле архива из нового формата
  {
    key: 'archiveId',
    label: 'Номер архива',
    description: 'Номер архива из нового формата записи',
    category: 'attributes'
  },

  // Документальные атрибуты
  {
    key: 'fio',
    label: 'ФИО',
    description: 'Фамилия, имя, отчество указанные в документе',
    category: 'attributes'
  },
  {
    key: 'date',
    label: 'Дата',
    description: 'Дата указанная в документе',
    category: 'attributes'
  },
  {
    key: 'documentNumber',
    label: 'Номер документа',
    description: 'Номер или код документа',
    category: 'attributes'
  },
  {
    key: 'address',
    label: 'Адрес',
    description: 'Адрес упомянутый в документе',
    category: 'attributes'
  },
  {
    key: 'organization',
    label: 'Организация',
    description: 'Название организации из документа',
    category: 'attributes'
  }
];

// Пропсы компонента конструктора отчёта
interface ReportConstructorProps {
  documents: DocumentData[];
  className?: string;
}

// Основной компонент конструктора отчёта
export const ReportConstructor: React.FC<ReportConstructorProps> = ({
  documents,
  className
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(['fileName', 'archiveId', 'fund', 'opis', 'delo', 'fio', 'date']);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic', 'attributes']);
  const [previewMode, setPreviewMode] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Группируем поля по категориям
  const fieldsByCategory = useMemo(() => {
    return REPORT_FIELDS.reduce((acc, field) => {
      if (!acc[field.category]) {
        acc[field.category] = [];
      }
      acc[field.category].push(field);
      return acc;
    }, {} as Record<string, ReportField[]>);
  }, []);

  // Создаём название для категорий
  const categoryLabels = {
    basic: 'Основная информация',
    attributes: 'Атрибуты документа',
    text: 'Текстовая информация'
  };

  // Обработчик изменения выбора полей
  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(key => key !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  // Обработчик выбора шаблона полей
  const handleTemplateSelect = (template: keyof typeof FIELD_TEMPLATES) => {
    const templateFields = FIELD_TEMPLATES[template];
    setSelectedFields([...templateFields]); // Создаём новый массив чтобы избежать readonly ошибки
  };

  // Обработчик переключения категории
  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  // Обработчик экспорта в CSV
  const handleExportCSV = async () => {
    if (selectedFields.length === 0 || documents.length === 0) {
      alert('Выберите поля для экспорта и убедитесь, что есть данные документов');
      return;
    }

    setIsExporting(true);
    try {
      // Используем функцию экспорта из csvExport.ts
      const result = exportDocumentsToCSV(documents, REPORT_FIELDS, selectedFields, 'archive_report');
      
      // Показываем уведомление об успехе
      setTimeout(() => {
        if (result && typeof result === 'object') {
          alert(`Отчёт успешно экспортирован!\nЭкспортировано ${result.rowsCount} документов с полями: ${result.exportedFields.join(', ')}`);
        } else {
          alert(`Отчёт успешно экспортирован!\nЭкспортировано ${documents.length} документов`);
        }
      }, 100);
      
    } catch (error) {
      console.error('Ошибка при экспорте CSV:', error);
      alert('Произошла ошибка при экспорте отчёта. Попробуйте снова.');
    } finally {
      setIsExporting(false);
    }
  };

  // Получаем данные для предварительного просмотра
  const previewData = useMemo(() => {
    const fieldsInfo = REPORT_FIELDS.filter(field => selectedFields.includes(field.key));
    return {
      headers: fieldsInfo.map(f => f.label),
      sampleRow: selectedFields.map(fieldKey => {
        const sampleDoc = documents[0] || {};
        switch (fieldKey) {
          case 'fileName': return sampleDoc.fileName || 'документ.pdf';
          case 'archiveCode': return sampleDoc.archiveCode || '01-0203-0745-000002';
          case 'recognizedText': return 'Распознанный текст документа...';
          case 'archiveId': return sampleDoc.archiveId || '1';
          case 'fund': return sampleDoc.fund || '203';
          case 'opis': return sampleDoc.opis || '745';
          case 'delo': return sampleDoc.delo || '2';
          case 'fio': return sampleDoc.fio || 'Иванов И.И.';
          case 'date': return sampleDoc.date || '15.03.2024';
          case 'documentNumber': return sampleDoc.documentNumber || '12345';
          case 'address': return 'г. Москва, ул. Примерная, д. 1';
          case 'organization': return 'Архивное учреждение';
          case 'processingDate': return new Date().toLocaleString('ru-RU');
          case 'fileSize': return '2.5 MB';
          case 'status': return 'Обработан';
          default: return 'Пример данных';
        }
      })
    };
  }, [selectedFields, documents]);

  // Создаём описание полей для заголовков
  const getFieldDescription = (fieldKey: string) => {
    const field = REPORT_FIELDS.find(f => f.key === fieldKey);
    return field?.description || '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Конструктор отчёта
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Выберите поля для экспорта отчёта в CSV-формате
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Информация о данных */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Доступно для экспорта: {documents.length} документов
          </h3>
          <div className="text-sm text-gray-600">
            Выберите из {REPORT_FIELDS.length} доступных полей для создания отчёта
          </div>
        </div>

        {/* Быстрые шаблоны */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Быстрые шаблоны:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTemplateSelect('basic')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Основная информация
            </button>
            <button
              onClick={() => handleTemplateSelect('archiveAttributes')}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              Архивные атрибуты
            </button>
            <button
              onClick={() => handleTemplateSelect('fullText')}
              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 rounded-md transition-colors"
            >
              С полным текстом
            </button>
            <button
              onClick={() => handleTemplateSelect('archiveFull')}
              className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 rounded-md transition-colors"
            >
              Полный архивный
            </button>
            <button
              onClick={() => handleTemplateSelect('newFormatArchival')}
              className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 rounded-md transition-colors"
            >
              Архивный формат записи
            </button>
          </div>
        </div>

        {/* Выбор полей по категориям */}
        <div className="space-y-4 mb-6">
          {Object.entries(fieldsByCategory).map(([category, fields]) => (
            <div key={category} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => handleCategoryToggle(category)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors flex items-center justify-between"
              >
                <h3 className="text-sm font-medium text-gray-900">
                  {categoryLabels[category as keyof typeof categoryLabels] || category}
                </h3>
                {expandedCategories.includes(category) ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedCategories.includes(category) && (
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-3">
                    {fields.map(field => (
                      <label
                        key={field.key}
                        className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => handleFieldToggle(field.key)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {selectedFields.includes(field.key) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {field.label}
                            </span>
                            {getFieldDescription(field.key) && (
                              <span className="text-xs text-gray-500">
                                {getFieldDescription(field.key)}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Предварительный просмотр */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Предварительный просмотр структуры отчёта
            </h3>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Скрыть' : 'Показать'}</span>
            </button>
          </div>
          
          {previewMode && selectedFields.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span className={selectedFields.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
                  Структура отчёта ({previewData.headers.length} колонок)
                </span>
              </div>
              
              {previewData.headers.length > 0 && (
                <div className="overflow-x-auto">

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {previewData.headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200 last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                   <tbody>
                      <tr className="border-b border-gray-200">
                        {previewData.sampleRow.map((cell, index) => (
                          <td
                            key={index}
                            className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 last:border-r-0"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
                Пример данных (показывается первая строка из {documents.length} документов)
              </div>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className={selectedFields.length === 0 ? 'text-red-500' : 'text-green-600'}>
              Выбрано полей: {selectedFields.length}
            </span>
            {selectedFields.length === 0 && (
              <span className="ml-2 text-red-500">• Выберите хотя бы одно поле</span>
            )}
          </div>
          
          <button
            onClick={handleExportCSV}
            disabled={selectedFields.length === 0 || documents.length === 0 || isExporting}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting 
                ? 'Экспорт...' 
                : 'Экспорт в CSV'
              }
            </span>
          </button>
        </div>

        {/* Информация о формате экспорта */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Информация о формате CSV:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>Формат: UTF-8 с BOM для корректного отображения русских символов</li>
            <li>Разделитель: запятая (,) согласно стандарту RFC 4180</li>
            <li>Экранирование: кавычки удваиваются, значения в кавычках если содержат запятые</li>
            <li>Совместимость: Excel, Google Sheets, LibreOffice Calc</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportConstructor;