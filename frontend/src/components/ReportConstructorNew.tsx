import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from './ui/button';
import { 
  Download, 
  FileText, 
  CheckSquare, 
  Square, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Archive,
  User,
  Calendar,
  MapPin,
  Building,
  Hash,
  Settings
} from 'lucide-react';
import { 
  ReportField, 
  ReportTemplate, 
  ReportConfiguration, 
  DocumentRecognitionResult,
  ArchiveCode 
} from '../../types/report';
import { parseArchiveCode, extractArchiveCodeFromPath, createDocumentPageInfo } from '../../lib/archiveUtils';

// Определение полей отчёта согласно требованиям
const REPORT_FIELDS: ReportField[] = [
  // Архивные поля (обязательные)
  {
    key: 'archiveCode',
    label: 'Архивный шифр',
    description: 'Полный архивный шифр документа (01-0203-0745-000002)',
    category: 'archive',
    required: true
  },
  {
    key: 'archiveId',
    label: 'Номер архива',
    description: 'Номер архива (01)',
    category: 'archive'
  },
  {
    key: 'fund',
    label: 'Фонд',
    description: 'Номер фонда (0203)',
    category: 'archive'
  },
  {
    key: 'signature',
    label: 'Подпись',
    description: 'Номер подписи (0745)',
    category: 'archive'
  },
  {
    key: 'caseNumber',
    label: 'Дело',
    description: 'Номер дела (000002)',
    category: 'archive'
  },

  // Поля для сквозного распознавания
  {
    key: 'fullText',
    label: 'Полный текст документа',
    description: 'Весь распознанный текст документа (для сквозного распознавания)',
    category: 'text'
  },

  // Атрибуты документа
  {
    key: 'fio',
    label: 'ФИО',
    description: 'Фамилия, имя, отчество',
    category: 'attributes'
  },
  {
    key: 'date',
    label: 'Дата',
    description: 'Дата документа',
    category: 'attributes'
  },
  {
    key: 'address',
    label: 'Адрес',
    description: 'Адрес места события',
    category: 'attributes'
  },
  {
    key: 'organization',
    label: 'Организация',
    description: 'Название организации',
    category: 'attributes'
  },
  {
    key: 'documentNumber',
    label: 'Номер документа',
    description: 'Номер или код документа',
    category: 'attributes'
  },

  // Информация о файле
  {
    key: 'fileName',
    label: 'Имя файла',
    description: 'Название файла страницы',
    category: 'file'
  },
  {
    key: 'pageNumber',
    label: 'Номер страницы',
    description: 'Номер страницы в деле',
    category: 'file'
  },
  {
    key: 'imageNumber',
    label: 'Номер образа',
    description: '8-значный номер образа',
    category: 'file'
  },
  {
    key: 'processingDate',
    label: 'Дата обработки',
    description: 'Дата и время обработки',
    category: 'file'
  }
];

// Шаблоны отчётов
const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'archiveFull',
    name: 'Полный архивный отчёт',
    description: 'Все архивные поля + атрибуты + информация о файле',
    fields: ['archiveCode', 'archiveId', 'fund', 'signature', 'caseNumber', 'fio', 'date', 'fileName', 'pageNumber'],
    recognitionType: 'both'
  },
  {
    id: 'archiveBasic',
    name: 'Базовый архивный отчёт',
    description: 'Только архивный шифр и основные атрибуты',
    fields: ['archiveCode', 'fio', 'date', 'fileName'],
    recognitionType: 'both'
  },
  {
    id: 'fullText',
    name: 'Сквозное распознавание',
    description: 'Архивный шифр + полный текст + информация о файле',
    fields: ['archiveCode', 'fullText', 'fileName', 'pageNumber'],
    recognitionType: 'full'
  },
  {
    id: 'attributeOnly',
    name: 'Только атрибуты',
    description: 'Архивный шифр + все атрибуты документа',
    fields: ['archiveCode', 'fio', 'date', 'address', 'organization', 'documentNumber'],
    recognitionType: 'attribute'
  },
  {
    id: 'archiveStructure',
    name: 'Структура архива',
    description: 'Разбивка архивного шифра по компонентам',
    fields: ['archiveId', 'fund', 'signature', 'caseNumber', 'fileName', 'pageNumber'],
    recognitionType: 'both'
  }
];

interface ReportConstructorNewProps {
  documents: DocumentRecognitionResult[];
  onExport: (config: ReportConfiguration) => void;
  className?: string;
}

export const ReportConstructorNew: React.FC<ReportConstructorNewProps> = ({
  documents,
  onExport,
  className = ''
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(['archiveCode', 'fio', 'date', 'fileName']);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('archiveBasic');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['archive', 'attributes']);
  const [previewMode, setPreviewMode] = useState(true);
  const [recognitionType, setRecognitionType] = useState<'full' | 'attribute' | 'both'>('both');

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

  // Названия категорий
  const categoryLabels = {
    archive: 'Архивные поля',
    attributes: 'Атрибуты документа',
    text: 'Текстовые поля',
    file: 'Информация о файле'
  };

  // Иконки для категорий
  const categoryIcons = {
    archive: Archive,
    attributes: User,
    text: FileText,
    file: Settings
  };

  // Обработчик изменения выбора полей
  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(key => key !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  // Обработчик выбора шаблона
  const handleTemplateSelect = (templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedFields([...template.fields]);
      setRecognitionType(template.recognitionType);
    }
  };

  // Обработчик переключения категории
  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  // Обработчик экспорта
  const handleExport = () => {
    const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    const config: ReportConfiguration = {
      template,
      selectedFields,
      outputFormat: 'csv',
      includePageInfo: selectedFields.some(field => ['fileName', 'pageNumber', 'imageNumber'].includes(field)),
      groupByArchive: true
    };

    onExport(config);
  };

  // Получаем данные для предварительного просмотра
  const previewData = useMemo(() => {
    const fieldsInfo = REPORT_FIELDS.filter(field => selectedFields.includes(field.key));
    const sampleDoc = documents[0];
    
    if (!sampleDoc) {
      return {
        headers: fieldsInfo.map(f => f.label),
        sampleRow: fieldsInfo.map(() => 'Нет данных')
      };
    }

    return {
      headers: fieldsInfo.map(f => f.label),
      sampleRow: selectedFields.map(fieldKey => {
        switch (fieldKey) {
          case 'archiveCode':
            return sampleDoc.archiveCode?.fullCode || '';
          case 'archiveId':
            return sampleDoc.archiveCode?.archiveId || '';
          case 'fund':
            return sampleDoc.archiveCode?.fund || '';
          case 'signature':
            return sampleDoc.archiveCode?.signature || '';
          case 'caseNumber':
            return sampleDoc.archiveCode?.caseNumber || '';
          case 'fullText':
            return sampleDoc.fullText || '';
          case 'fio':
            return sampleDoc.attributes?.find(a => a.type === 'fio')?.value || '';
          case 'date':
            return sampleDoc.attributes?.find(a => a.type === 'date')?.value || '';
          case 'address':
            return sampleDoc.attributes?.find(a => a.type === 'address')?.value || '';
          case 'organization':
            return sampleDoc.attributes?.find(a => a.type === 'organization')?.value || '';
          case 'documentNumber':
            return sampleDoc.attributes?.find(a => a.type === 'documentNumber')?.value || '';
          case 'fileName':
            return sampleDoc.pageInfo?.fileName || '';
          case 'pageNumber':
            return sampleDoc.pageInfo?.pageNumber?.toString() || '';
          case 'imageNumber':
            return sampleDoc.pageInfo?.imageNumber || '';
          case 'processingDate':
            return sampleDoc.processingDate?.toLocaleString('ru-RU') || '';
          default:
            return '';
        }
      })
    };
  }, [selectedFields, documents]);

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
              Настройте структуру отчёта для экспорта результатов распознавания
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
            Выберите поля для создания отчёта с привязкой к архивному шифру
          </div>
        </div>

        {/* Шаблоны отчётов */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Шаблоны отчётов:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {template.name}
                </h4>
                <p className="text-xs text-gray-600">
                  {template.description}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {template.fields.length} полей
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Выбор полей по категориям */}
        <div className="space-y-4 mb-6">
          {Object.entries(fieldsByCategory).map(([category, fields]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-medium text-gray-900">
                      {categoryLabels[category as keyof typeof categoryLabels] || category}
                    </h3>
                  </div>
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
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {field.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                <span className="text-gray-900">
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
                            {cell || <span className="text-gray-400 italic">Пусто</span>}
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
              <span className="ml-2 text-red-500">Выберите хотя бы одно поле</span>
            )}
          </div>
          
          <Button
            onClick={handleExport}
            disabled={selectedFields.length === 0 || documents.length === 0}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт в CSV</span>
          </Button>
        </div>

        {/* Информация о формате */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Структура отчёта:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Первая колонка: архивный шифр (обязательно)</li>
            <li>• Для сквозного распознавания: архивный шифр + полный текст + реквизиты файла</li>
            <li>• Для атрибутивного распознавания: архивный шифр + разбивка по атрибутам</li>
            <li>• Последняя колонка: реквизиты файла страницы</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportConstructorNew;
