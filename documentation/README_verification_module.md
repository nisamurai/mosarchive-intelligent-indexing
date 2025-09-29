# Модуль верификации результатов распознавания

## Обзор

Модуль верификации результатов (`VerifyPage`) представляет собой комплексный React-компонент для проверки и коррекции текста, распознанного из архивных документов с помощью ИИ. Компонент обеспечивает интерактивную работу с изображениями документов и их распознанным текстом.

## Архитектура модуля

```
VerifyPage
├── ImageToolbar              # Панель инструментов изображения
│   ├── ZoomControls         # Управление масштабом
│   ├── RotateButton         # Поворот изображения
│   └── DownloadButton       # Скачивание изображения
├── ImageViewer              # Область просмотра изображения
│   ├── ImageContainer       # Контейнер изображения
│   ├── ZoomIndicator        # Индикатор масштаба
│   └── WheelControls        # Управление колесиком мыши
├── TextEditor               # Редактор текста
│   ├── EditModeToggle       # Переключение режимов
│   ├── TextareaField        # Поле редактирования
│   └── ValidationErrors     # Ошибки валидации
├── HighlightedText          # Подсветка изменений
└── StatusPanel             # Панель статуса
    ├── ValidationInfo        # Информация о валидации
    ├── StatisticsInfo        # Статистика текста
    └── StateSyncInfo        # Синхронизация состояния
```

## Основные компоненты

### ImageToolbar

Панель инструментов для работы с изображением документа.

**Интерфейс:**
```typescript
interface ImageToolbarProps {
  onZoomIn: () => void;       // Увеличение масштаба
  onZoomOut: () => void;      // Уменьшение масштаба
  onRotate: () => void;       // Поворот изображения
  onDownload: () => void;     // Скачивание файла
  zoomLevel: number;          // Текущий уровень масштаба
  className?: string;         // CSS классы
}
```

**Функциональность:**
- Контроль масштаба изображения (50% - 500%)
- Поворот изображения на 90° по часовой стрелке
- Скачивание изображения документа
- Отображение текущего уровня масштаба
- Адаптивные иконки и подписи

### HighlightedText

Компонент для выделения изменений между оригинальным и отредактированным текстом.

**Интерфейс:**
```typescript
interface HighlightedTextProps {
  originalText: string;        // Исходный текст
  editedText: string;         // Отредактированный текст
  className?: string;         // CSS классы
}
```

**Алгоритм подсветки:**
1. Сравнение строк между оригиналом и редакцией
2. Выделение измененных строк желтым фоном
3. Сохранение неизмененных участков без модификации

## Состояние и хуки

### Основное состояние

```typescript
interface VerifyPageState {
  // Изображение
  imageZoom: number;           // Масштаб изображения (1 = 100%)
  imageRotate: number;         // Угол поворота (0°, 90°, 180°, 270°)
  
  // Текст
  editedText: string;          // Отредактированный текст
  isEditing: boolean;          // Режим редактирования
  
  // Валидация
  validationInfo: TextValidationInfo;
  
  // Сохранение
  isSaving: boolean;           // Состояние процесса сохранения
}
```

### Текстовая валидация

```typescript
interface TextValidationInfo {
  hasChanges: boolean;         // Присутствуют ли изменения
  originalLength: number;      // Длина исходного текста
  editedLength: number;        // Длина редакции
  validationErrors: string[];  // Массив ошибок валидации
}
```

## Правила валидации

Модуль выполняет автоматическую валидацию вводимого текста:

### Проверки корректности

1. **Проверка на пустоту**: Текст не может быть пустым
2. **Контроль длины**: Изменения не должны превышать 200% от оригинала
3. **Минимальная длина**: Текст не должен сокращаться более чем на 50%

### Настройка валидации

```typescript
const validationRules = {
  minLengthRatio: 0.5,    // Минимально допустимая длина (50% от оригинала)
  maxLengthRatio: 2.0,    // Максимально допустимая длина (200% от оригинала)
  emptyTextMessage: 'Текст не может быть пустым',
  tooShortMessage: 'Текст стал значительно короче оригинала',
  tooLongMessage: 'Текст стал significantly длиннее оригинала'
};
```

## API модуля

### Props компонента

```typescript
interface VerifyPageProps {
  imageUrl: string;                        // URL изображения документа
  recognizedText: string;                 // Распознанный текст для верификации
  fileName?: string;                      // Имя файла документа
  onSave?: (editedText: string) => Promise<void>; // Коллбек сохранения
  onCancel?: () => void;                  // Коллбек отмены
  className?: string;                     // Дополнительные CSS классы
}
```

### Методы компонента

#### handleTextChange
```typescript
const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => void
```
Обработчик изменения текста с автоматической валидацией.

#### handleSave
```typescript
const handleSave = async (): Promise<void> => void
```
Аспектный обработчик сохранения с валидацией и обработкой ошибок.

#### handleCancel
```typescript
const handleCancel = (): void => void
```
Отмена изменений и возврат к исходному тексту.

### Управление изображением

#### Zoom Control
```typescript
const handleZoomIn = useCallback(() => {
  setImageZoom(prev => Math.min(prev * 1.2, 5)); // До 500%
}, []);

const handleZoomOut = useCallback(() => {
  setImageZoom(prev => Math.max(prev / 1.2, 0.5)); // До 50%
}, []);
```

#### Wheel Zoom
```typescript
const handleWheel = useCallback((e: React.WheelEvent) => {
  if (e.ctrlKey) {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  }
}, [handleZoomIn, handleZoomOut]);
```

#### Image Rotation
```typescript
const handleRotate = useCallback(() => {
  setImageRotate(prev => (prev + 90) % 360);
}, []);
```

## Интеграция с состоянием приложения

### Синхронизация данных

При сохранении результатов модуль обновляет глобальное состояние приложения:

```typescript
const handleSaveVerification = async (editedText: string) => {
  if (!verifyFile) return;
  
  // Обновление состояния обработанных файлов
  setProcessedFiles(prev => prev.map(file => 
    file.file === verifyFile.file 
      ? { ...file, recognizedText: editedText }
      : file
  ));
  
  // Возврат к основному интерфейсу
  setCurrentState('upload');
  
  // Очистка ресурсов
  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
  }
};
```

### Управление памятью

Модуль автоматически управляет blob URL объектами для предотвращения утечек памяти:

```typescript
// Создание URL при инициации верификации
const handleVerifyFile = (processedFile: ProcessedFile) => {
  setImageUrl(URL.createObjectURL(processedFile.file));
  setCurrentState('verify');
};

// Очистка при завершении
const handleCancelVerification = () => {
  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
  }
};
```

## События и обратное взаимодействие

### Жизненный цикл компонента

1. **Инициализация**: Создание blob URL для изображения
2. **Режим просмотра**: Отображение текста с подсветкой изменений
3. **Режим редактирования**: Активное редактирование с валидацией
4. **Валидация**: Проверка корректности в реальном времени
5. **Сохранение**: Обновление состояния приложения
6. **Очистка**: Освобождение ресурсов памяти

### Callback функции

```typescript
// Сохранение результатов
const onSave = async (editedText: string): Promise<void> => {
  try {
    await handleSaveVerification(editedText);
    // Обновление состояние успешно
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    throw error; // Компонент покажет ошибку пользователю
  }
};

// Отмена изменений
const onCancel = (): void => {
  handleCancelVerification();
  // Автоматическая очистка ресурсов
};
```

## Производительность и оптимизация

### Мемоизация

```typescript
// Отслеживание изменений валидации
const validateText = useCallback((text: string): TextValidationInfo => {
  // Вычисления только при изменении текста
}, [recognizedText]);

// Обработчики событий изображения
const handleZoomIn = useCallback(() => {
  // Оптимизация ре-рендеров
}, []);
```

### Ленивая загрузка

Изображения загружаются только при запуске верификации:

```typescript
const imageRef = useRef<HTMLImageElement>(null);

// Предварительная загрузка при необходимости
useEffect(() => {
  if (imageUrl && imageRef.current) {
    const img = new Image();
    img.src = imageUrl;
  }
}, [imageUrl]);
```

## Доступность (Accessibility)

### ARIA-атрибуты

```typescript
// Панель инструментов
<div 
  role="toolbar" 
  aria-label="Инструменты изображения"
  aria-orientation="horizontal"
>
  <button
    onClick={onZoomIn}
    aria-label="Увеличить изображение"
    title="Увеличить (Ctrl + колесико вверх)"
  >
    <ZoomIn className="w-4 h-4" />
  </button>
</div>

// Редактор текста
<textarea
  ref={textareaRef}
  aria-label="Текст документа для редактирования"
  aria-describedby="validation-errors"
  role="textbox"
  aria-multiline="true"
>
</textarea>
```

### Навигация клавиатурой

- **Tab**: Переход между элементами интерфейса
- **Enter/Space**: Активация кнопок
- **Escape**: Отмена изменений
- **Ctrl + колесико**: Масштабирование изображения
- **Arrow Keys**: Навигация в тексте

## Обработка ошибок

### Типы ошибок

```typescript
enum VerificationError {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

### Пользовательские сообщения

```typescript
const errorMessages = {
  VALIDATION_ERROR: 'Обнаружены ошибки в тексте. Проверьте ввод.',
  SAVE_ERROR: 'Ошибка сохранения изменений. Попробуйте еще раз.',
  IMAGE_LOAD_ERROR: 'Не удается загрузить изображение документа.',
  NETWORK_ERROR: 'Проблемы с сетью. Проверьте подключение.'
};
```

## Кастомизация

### Стилизация

Компонент использует Tailwind CSS для стилизации с возможностью кастомизации:

```typescript
// Цветовая схема по умолчанию
const themeConfig = {
  colors: {
    primary: 'blue-600',
    secondary: 'gray-600', 
    success: 'green-600',
    warning: 'yellow-100',
    danger: 'red-600',
    background: 'gray-50'
  }
};

// Кастомизация через className
<VerifyPage 
  className="custom-verification-theme"
  // ... другие пропсы
/>
```

### Настройки валидации

```typescript
interface ValidationConfig {
  maxZoomLevel?: number;       // Максимальный зум (по умолчанию 5)
  minZoomLevel?: number;       // Минимальный зум (по умолчанию 0.5)
  zoomStep?: number;           // Шаг масштабирования (по умолчанию 1.2)
  rotationStep?: number;      // Шаг поворота (по умолчанию 90°)
  validationRules?: ValidationRules;
}
```

## Тестирование

### Unit тесты

```typescript
describe('VerifyPage Component', () => {
  test('should validate text changes correctly', () => {
    const { textValidationInfo } = renderComponent();
    expect(textValidationInfo.hasChanges).toBe(false);
  });

  test('should handle zoom controls', () => {
    const { zoomIn, zoomOut } = renderComponent();
    zoomIn();
    expect(getZoomLevel()).toBe(1.2);
    zoomOut();
    expect(getZoomLevel()).toBe(1.0);
  });
});
```

### Integration тесты

```typescript
describe('Verification Integration', () => {
  test('should save changes and sync state', async () => {
    const saveHandler = jest.fn();
    const component = render(<VerifyPage onSave={saveHandler} />);
    
    await editText('Новый текст');
    await saveChanges();
    
    expect(saveHandler).toHaveBeenCalledWith('Новый текст');
  });
});
```

## Расширение функциональности

### Мои возможности для расширения

1. **Множественное выделение**: Редактирование отдельных фрагментов текста
2. **Аннотации**: Добавление комментариев к участкам документа
3. **Сравнение версий**: Просмотр изменений между версиями
4. **Экспорт результатов**: Сохранение в различных форматах
5. **История изменений**: Отслеживание истории правок

### Архитектурные улучшения

1. **Виртуализация**: Обработка больших текстов
2. **Офлайн режим**: Работа без подключения к интернету
3. **Плагины**: Система расширений для кастомизации
4. **Конфигурация**: Файлы настроек для параметров валидации
