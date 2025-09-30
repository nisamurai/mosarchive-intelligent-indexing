# Конструктор отчёта и экспорт в CSV

## Описание

Конструктор отчёта — это модульная система для создания и экспорта отчётов по обработанным документам в формате CSV. Пользователи могут выбирать необходимые поля для экспорта и получать структурированные отчёты с данными из архивных документов.

## Основные возможности

- ✅ **Выбор полей для экспорта** - возможность выбирать из 13+ доступных полей
- ✅ **Предустановленные шаблоны** - быстрое создание отчётов по категориям
- ✅ **Предварительный просмотр** - таблица с заголовками и образцами данных
- ✅ **Корректная кодировка** - UTF-8 с BOM для Excel
- ✅ **Экранирование CSV** - полная совместимость с RFC 4180
- ✅ **Статистика данных** - информация о количестве документов и полей

## Структура данных

### Доступные поля отчёта

#### Основная информация
- `fileName` - Имя файла документа
- `processingDate` - Дата и время обработки
- `fileSize` - Размер файла в мегабайтах
- `status` - Статус обработки документа

#### Архивные атрибуты
- `fund` - Номер архивного фонда
- `opis` - Номер описи
- `delo` - Номер дела
- `archiveCode` - Полный архивный шифр
- `fio` - Фамилия, имя, отчество из документа
- `date` - Дата указанная в документе
- `documentNumber` - Номер или код документа
- `organization` - Название организации
- `address` - Адрес из документа

#### Текстовые данные
- `recognizedText` - Весь распознанный текст документа

### Пример структуры данных

```typescript
interface DocumentData {
  fileName: string;
  archiveCode?: string;
  recognizedText?: string;
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
}
```

## Предустановленные шаблоны

### 1. Основная информация (`basic`)
```javascript
['fileName', 'processingDate', 'fileSize', 'status']
```

### 2. Архивные атрибуты (`archiveAttributes`)
```javascript
['fund', 'opis', 'delo', 'fio', 'date', 'documentNumber']
```

### 3. Документальные атрибуты (`docAttributes`)
```javascript
['fio', 'date', 'documentNumber', 'address', 'organization']
```

### 4. С полным текстом (`fullText`)
```javascript
['fileName', 'recognizedText', 'processingDate']
```

### 5. Полный архивный (`archiveFull`)
```javascript
['archiveCode', 'fund', 'opis', 'delo', 'fio', 'date', 'documentNumber', 'fileName']
```

## Использование в коде

### 1. Базовое использование

```typescript
import { exportDocumentsToCSV } from './lib/csvExport';
import { createSampleData } from './lib/documentDataAdapter';

// Создаём тестовые данные
const documents = createSampleData(5);

// Определяем поля для отчёта
const fields = [
  { key: 'fileName', label: 'Имя файла', category: 'basic' },
  { key: 'fund', label: 'Фонд', category: 'attributes' },
  { key: 'fio', label: 'ФИО', category: 'attributes' },
  { key: 'date', label: 'Дата', category: 'attributes' }
];

// Выбираем поля для экспорта
const selectedFields = ['fileName', 'fund', 'fio', 'date'];

// Экспортируем в CSV
const result = exportDocumentsToCSV(documents, fields, selectedFields, 'archive_report');
console.log('Экспорт завершён:', result);
```

### 2. Использование шаблонов

```typescript
import { FIELD_TEMPLATES } from './lib/csvExport';

// Используем готовый шаблон
const selectedFields = FIELD_TEMPLATES.archiveAttributes;

const result = exportDocumentsToCSV(documents, fields, selectedFields, 'template_report');
```

### 3. Интеграция в React-компонент

```typescript
import ReportConstructor from './components/ReportConstructor';

function App() {
  const documents = getDocumentsData(); // получение данных
  
  return (
    <ReportConstructor 
      documents={documents}
      className="my-report-constructor"
    />
  );
}
```

## Формат экспорта CSV

### Спецификация формата

- **Кодировка**: UTF-8 с BOM для корректного отображения русских символов
- **Разделитель**: запятая (,) согласно стандарту RFC 4180
- **Экранирование**: кавычки удваиваются, значения заключаются в кавычки если содержат служебные символы
- **Совместимость**: Excel, Google Sheets, LibreOffice Calc

### Пример CSV

```csv
Имя файла,Архивный шифр,Фонд,Опись,Дело,ФИО,Дата
заявление_о_справке.pdf,"01-0203-0745-000002",1,203,745,"Иванов И.И.",15.03.1924
метрическая_запись.tiff,"02-1545-0321-000045",2,1545,321,"Петрова А.С.",22.07.1941
```

### Функция экранирования

```typescript
const escapeCSVValue = (value: any): string => {
  const stringValue = String(value || '');
  const needsQuoting = stringValue.includes(',') || 
                       stringValue.includes('"') || 
                       stringValue.includes('\n') || 
                       stringValue.includes('\r');
  
  if (!needsQuoting) {
    return stringValue;
  }
  
  const escapedValue = stringValue.replace(/"/g, '""');
  return `"${escapedValue}"`;
};
```

## Пользовательский интерфейс

### Особенности интерфейса

1. **Группировка полей по категориям** - поля сгруппированы по типам: основная информация, атрибуты документа, текстовая информация
2. **Сворачиваемые секции** - категории можут быть развёрнуты или свёрнуты
3. **Быстрые шаблоны** - кнопки для мгновенного применения предустановленных наборов полей
4. **Предварительный просмотр** - таблица показывает структуру данных перед экспортом
5. **Валидация** - интерфейс проверяет выбор полей и показывает соответствующие предупреждения

### Структура компонента

```typescript
export const ReportConstructor: React.FC<ReportConstructorProps> = ({
  documents,
  className
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(['fileName', 'fund', 'opis', 'delo', 'fio', 'date']);
  const [expandedCategories, setExpandedCategories] = useSelector([]);
  const [previewMode, setPreviewMode] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // ... логика компонента
};
```

## Файловая структура

```
src/
├── components/
│   └── ReportConstructor.tsx      # Основной компонент конструктора
├── lib/
│   ├── csvExport.ts              # Утилиты для экспорта CSV
│   └── documentDataAdapter.ts    # Адаптеры данных документов
├── examples/
│   └── reportExample.ts          # Примеры использования
└── documentation/
    └── README_report_constructor.md
```

## Примеры использования

### Пример 1: Экспорт архивных данных

```typescript
const selectedFields = ['fund', 'opis', 'delo', 'fio', 'date'];
const result = exportDocumentsToCSV(documents, fields, selectedFields, 'archive_data');
```

Результат:
```csv
Фонд,Опись,Дело,ФИО,Дата
203,745,2,"Иванов И.И.",15.03.1924
1545,321,45,"Петрова А.С.",22.07.1941
```

### Пример 2: Экспорт с полным текстом

```typescript
const selectedFields = ['fileName', 'recognizedText', 'processingDate', 'fio'];
const result = exportDocumentsToCSV(documents, fields, selectedFields, 'text_export');
```

Результат включает полные тексты документов в отдельных колонках.

### Пример 3: Пакетный экспорт

```typescript
// Экспорт нескольких отчётов в разных форматах
const templates = [
  { name: 'brief', fields: FIELD_TEMPLATES.basic },
  { name: 'archive', fields: FIELD_TEMPLATES.archiveAttributes },
  { name: 'full', fields: FIELD_TEMPLATES.archiveFull }
];

templates.forEach(template => {
  exportDocumentsToCSV(documents, fields, template.fields, template.name);
});
```

## Настройка и расширение

### Добавление новых полей

1. **Определите поле в интерфейсе**:
```typescript
interface DocumentData {
  // ... существующие поля
  newField?: string;
}
```

2. **Добавьте в список доступных полей**:
```typescript
const newField: ReportField = {
  key: 'newField',
  label: 'Новое поле',
  description: 'Описание нового поля',
  category: 'attributes' // или 'basic' или 'text'
};
```

3. **Обновите функцию извлечения значений**:
```typescript
export const getFieldValue = (document: DocumentData, fieldKey: string): string => {
  switch (fieldKey) {
    // ... существующие случаи
    case 'newField':
      return document.newField || '';
    default:
      return String((document as any)[fieldKey] || '');
  }
};
```

### Создание новых шаблонов

```typescript
export const FIELD_TEMPLATES = {
  // ... существующие шаблоны
  customTemplate: ['field1', 'field2', 'field3']
} as const;
```

## Обработка ошибок

### Типичные ошибки и решения

1. **Проблемы с кодировкой в Excel**
   - Решение: используется UTF-8 BOM для автоматического определения кодировки

2. **Неправильное экранирование символов**
   - Решение: функция `escapeCSVValue` корректно обрабатывает все служебные символы

3. **Большой объём данных**
   - Решение: функция поддерживает экспорт тысяч документов с прогресс-индикатором

4. **Отсутствие данных**
   - Решение: валидация входных данных с информативными сообщениями об ошибках

### Код обработки ошибок

```typescript
try {
  const result = exportDocumentsToCSV(documents, fields, selectedFields, fileName);
  console.log('✅ Экспорт завершён успешно:', result);
} catch (error) {
  console.error('❌ Ошибка при экспорте:', error.message);
  alert('Произошла ошибка при экспорте отчёта. Проверьте консоль для подробностей.');
}
```

## Тестирование

### Демонстрационный пример

Откройте файл `report_export_demo.html` в браузере для интерактивного тестирования всех функций конструктора отчёта.

### Примеры в коде

Запустите примеры из `src/examples/reportExample.ts`:

```typescript
import { runAllExamples } from './examples/reportExample';

// Запуск всех примеров
runAllExamples();
```

### Проверка совместимости браузера

```typescript
import { checkBrowserSupport } from './lib/csvExport';

if (checkBrowserSupport()) {
  console.log('✅ Браузер поддерживает экспорт CSV');
} else {
  console.log('❌ Браузер не поддерживает функции экспорта');
}
```

## Заключение

Конструктор отчёта предоставляет гибкую и мощную систему для экспорта данных обработанных документов. Вы можете:

- 🎯 **Выбирать нужные поля** из 13+ доступных вариантов
- 📋 **Использовать готовые шаблоны** для быстрого создания отчётов
- 👀 **Предварительно просматривать** структуру данных
- 💾 **Экспортировать в CSV** с корректной кодировкой для Excel
- 📊 **Получать статистику** по экспортируемым данным
- 🔧 **Легко расширять** функциональность новыми полями и шаблонами

Система готова к использованию и может быть интегрирована в любое приложение с минимальными изменениями.
