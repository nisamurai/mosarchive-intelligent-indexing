# Конструктор отчёта и экспорт в CSV

## Описание

Конструктор отчёта — это модульная система для создания и экспорта отчётов по обработанным документам в формате CSV. Пользователи могут выбирать необходимые поля для экспорта и получать структурированные отчёты с данными из архивных документов.

## Основные возможности

- **Выбор полей для экспорта** - возможность выбирать из 13+ доступных полей
- **Предустановленные шаблоны** - быстрое создание отчётов по категориям
- **Предварительный просмотр** - таблица с заголовками и образцами данных
- **Корректная кодировка** - UTF-8 с BOM для Excel
- **Экранирование CSV** - полная совместимость с RFC 4180
- **Статистика данных** - информация о количестве документов и полей

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

### Структура данных

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

### Базовое использование

```typescript
import { exportDocumentsToCSV } from './lib/csvExport';

// Создаём тестовые данные
const documents = createSampleData(5);

// Выбираем поля для экспорта
const selectedFields = ['fileName', 'fund', 'fio', 'date'];

// Экспортируем в CSV
const result = exportDocumentsToCSV(documents, fields, selectedFields, 'archive_report');
```

### Использование шаблонов

```typescript
import { FIELD_TEMPLATES } from './lib/csvExport';

// Используем готовый шаблон
const selectedFields = FIELD_TEMPLATES.archiveAttributes;
const result = exportDocumentsToCSV(documents, fields, selectedFields, 'template_report');
```

### Интеграция в React-компонент

```typescript
import ReportConstructor from './components/ReportConstructor';

function App() {
  const documents = getDocumentsData();
  
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

## Пользовательский интерфейс

### Особенности интерфейса

1. **Группировка полей по категориям** - поля сгруппированы по типам
2. **Сворачиваемые секции** - категории могут быть развёрнуты или свёрнуты
3. **Быстрые шаблоны** - кнопки для мгновенного применения предустановленных наборов полей
4. **Предварительный просмотр** - таблица показывает структуру данных перед экспортом
5. **Валидация** - интерфейс проверяет выбор полей и показывает соответствующие предупреждения

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

### Экспорт архивных данных

```typescript
const selectedFields = ['fund', 'opis', 'delo', 'fio', 'date'];
const result = exportDocumentsToCSV(documents, fields, selectedFields, 'archive_data');
```

### Экспорт с полным текстом

```typescript
const selectedFields = ['fileName', 'recognizedText', 'processingDate', 'fio'];
const result = exportDocumentsToCSV(documents, fields, selectedFields, 'text_export');
```

### Пакетный экспорт

```typescript
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
  newField?: string;
}
```

2. **Добавьте в список доступных полей**:
```typescript
const newField: ReportField = {
  key: 'newField',
  label: 'Новое поле',
  category: 'attributes'
};
```

### Создание новых шаблонов

```typescript
export const FIELD_TEMPLATES = {
  customTemplate: ['field1', 'field2', 'field3']
} as const;
```

## Обработка ошибок

### Типичные ошибки и решения

1. **Проблемы с кодировкой в Excel** - используется UTF-8 BOM
2. **Неправильное экранирование символов** - функция `escapeCSVValue`
3. **Большой объём данных** - поддержка экспорта тысяч документов
4. **Отсутствие данных** - валидация входных данных

### Код обработки ошибок

```typescript
try {
  const result = exportDocumentsToCSV(documents, fields, selectedFields, fileName);
  console.log('✅ Экспорт завершён успешно:', result);
} catch (error) {
  console.error('❌ Ошибка при экспорте:', error.message);
  alert('Произошла ошибка при экспорте отчёта.');
}
```

## Заключение

Конструктор отчёта предоставляет гибкую систему для экспорта данных обработанных документов:

- **Выбор полей** из 13+ доступных вариантов
- **Готовые шаблоны** для быстрого создания отчётов
- **Предварительный просмотр** структуры данных
- **Экспорт в CSV** с корректной кодировкой для Excel
- **Статистика** по экспортируемым данным
- **Расширяемость** новыми полями и шаблонами
