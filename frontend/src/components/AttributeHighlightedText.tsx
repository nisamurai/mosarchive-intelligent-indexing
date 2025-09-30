import React from 'react';

// Интерфейс для атрибута с позицией
interface AttributePosition {
  value: string;
  start: number;
  end: number;
}

// Интерфейс для атрибутов с позициями
interface AttributesWithPositions {
  fio: AttributePosition[];
  date: AttributePosition[];
  address: AttributePosition[];
  archive_code: AttributePosition[];
  document_number: AttributePosition[];
  organization: AttributePosition[];
}

// Пропсы компонента
interface AttributeHighlightedTextProps {
  text: string;
  attributes: AttributesWithPositions;
  className?: string;
}

// Цвета для разных типов атрибутов
const ATTRIBUTE_COLORS = {
  fio: '#ff6b6b',      // Красный для ФИО
  date: '#4ecdc4',     // Бирюзовый для дат
  address: '#45b7d1',  // Синий для адресов
  archive_code: '#96ceb4',  // Зеленый для архивных кодов
  document_number: '#feca57',  // Желтый для номеров документов
  organization: '#ff9ff3'  // Розовый для организаций
};

// Названия атрибутов для отображения
const ATTRIBUTE_LABELS = {
  fio: 'ФИО',
  date: 'Дата',
  address: 'Адрес',
  archive_code: 'Архивный шифр',
  document_number: 'Номер документа',
  organization: 'Организация'
};

// Функция для создания HTML с подсветкой атрибутов
const highlightTextWithAttributes = (
  text: string, 
  attributes: AttributesWithPositions
): string => {
  // Создаем список всех выделений
  const highlights: Array<{
    start: number;
    end: number;
    color: string;
    type: string;
    value: string;
  }> = [];

  // Собираем все атрибуты в один массив
  Object.entries(attributes).forEach(([attrType, items]) => {
    items.forEach(item => {
      highlights.push({
        start: item.start,
        end: item.end,
        color: ATTRIBUTE_COLORS[attrType as keyof typeof ATTRIBUTE_COLORS] || '#cccccc',
        type: attrType,
        value: item.value
      });
    });
  });

  // Сортируем по позиции
  highlights.sort((a, b) => a.start - b.start);

  // Создаем HTML с подсветкой
  let result = '';
  let lastEnd = 0;

  highlights.forEach(highlight => {
    // Добавляем текст до выделения
    result += text.slice(lastEnd, highlight.start);
    
    // Добавляем выделенный текст
    result += `<span 
      style="background-color: ${highlight.color}; 
             padding: 2px 4px; 
             border-radius: 3px; 
             margin: 0 1px;
             color: white;
             font-weight: 500;
             cursor: help;" 
      title="${ATTRIBUTE_LABELS[highlight.type as keyof typeof ATTRIBUTE_LABELS]}: ${highlight.value}"
      data-attribute-type="${highlight.type}"
      data-attribute-value="${highlight.value}"
    >${text.slice(highlight.start, highlight.end)}</span>`;
    
    lastEnd = highlight.end;
  });

  // Добавляем оставшийся текст
  result += text.slice(lastEnd);

  return result;
};

// Основной компонент
export const AttributeHighlightedText: React.FC<AttributeHighlightedTextProps> = ({
  text,
  attributes,
  className = ''
}) => {
  const highlightedHtml = highlightTextWithAttributes(text, attributes);

  return (
    <div className={`attribute-highlighted-text ${className}`}>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
      
      {/* Легенда атрибутов */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Легенда атрибутов:</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ATTRIBUTE_COLORS).map(([type, color]) => {
            const hasAttributes = attributes[type as keyof AttributesWithPositions]?.length > 0;
            if (!hasAttributes) return null;
            
            return (
              <div key={type} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">
                  {ATTRIBUTE_LABELS[type as keyof typeof ATTRIBUTE_LABELS]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения извлеченных атрибутов в виде списка
export const AttributeList: React.FC<{
  attributes: Record<string, string>;
  className?: string;
}> = ({ attributes, className = '' }) => {
  const attributeLabels = {
    fio: 'ФИО',
    date: 'Дата',
    address: 'Адрес',
    archive_code: 'Архивный шифр',
    document_number: 'Номер документа',
    organization: 'Организация'
  };

  return (
    <div className={`attribute-list ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Извлеченные атрибуты:</h4>
      <div className="space-y-2">
        {Object.entries(attributes).map(([key, value]) => {
          if (!value) return null;
          
          return (
            <div key={key} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div 
                  className="w-3 h-3 rounded mt-1"
                  style={{ 
                    backgroundColor: ATTRIBUTE_COLORS[key as keyof typeof ATTRIBUTE_COLORS] || '#cccccc' 
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {attributeLabels[key as keyof typeof attributeLabels] || key}
                </p>
                <p className="text-sm text-gray-900 break-words">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttributeHighlightedText;
