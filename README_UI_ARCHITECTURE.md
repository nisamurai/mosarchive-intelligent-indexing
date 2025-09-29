# UI-архитектура MosArchive Intelligent Indexing

## Обзор

Данный документ описывает архитектуру пользовательского интерфейса приложения MosArchive Intelligent Indexing, построенного на React + bun с использованием UI-библиотеки shadcn/ui.

## Технологический стек

- **Frontend**: React 19 + TypeScript
- **Сборщик**: Vite
- **Пакетный менеджер**: Bun
- **Стили**: Tailwind CSS
- **UI-библиотека**: shadcn/ui + Radix UI
- **Роутинг**: React Router DOM
- **Иконки**: Lucide React
- **Состояние**: React Context + Hooks

## Структура проекта

```
src/
├── components/
│   ├── ui/                    # UI-компоненты из shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   └── stepper.tsx
│   ├── layout/                # Компоненты макета
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Navigation.tsx
│   ├── pages/                 # Страницы приложения
│   │   ├── UploadPage.tsx
│   │   ├── PreprocessPage.tsx
│   │   ├── OcrPage.tsx
│   │   ├── VerifyPage.tsx
│   │   ├── ReportPage.tsx
│   │   ├── StatsPage.tsx
│   │   └── LoginPage.tsx
│   └── common/                # Общие компоненты
│       ├── FileUpload.tsx
│       ├── DocumentViewer.tsx
│       └── TextEditor.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── NavigationContext.tsx  # Контекст для навигации
│   └── ProcessingContext.tsx  # Контекст для состояния обработки
├── hooks/
│   ├── useAuth.ts
│   ├── useNavigation.ts
│   └── useProcessing.ts
├── lib/
│   ├── utils.ts
│   ├── constants.ts
│   └── api.ts
├── types/
│   ├── auth.ts
│   ├── navigation.ts
│   └── processing.ts
└── App.tsx
```

## Этапы обработки документов

### 1. Загрузка (UploadPage)
- **Путь**: `/upload`
- **Функциональность**: Загрузка документов через drag-and-drop
- **Компоненты**: UploadComponent, ProgressBar
- **Состояние**: Список загруженных файлов

### 2. Предобработка (PreprocessPage)
- **Путь**: `/preprocess`
- **Функциональность**: Настройка параметров предобработки изображений
- **Компоненты**: Stepper, Card, Button
- **Состояние**: Параметры обработки

### 3. OCR (OcrPage)
- **Путь**: `/ocr`
- **Функциональность**: Распознавание текста из изображений
- **Компоненты**: Progress, Card, Button
- **Состояние**: Прогресс обработки

### 4. Верификация (VerifyPage)
- **Путь**: `/verify`
- **Функциональность**: Проверка и редактирование распознанного текста
- **Компоненты**: TextEditor, DocumentViewer
- **Состояние**: Отредактированный текст

### 5. Отчёт (ReportPage)
- **Путь**: `/report`
- **Функциональность**: Генерация отчётов в различных форматах
- **Компоненты**: Card, Button, FileDownload
- **Состояние**: Настройки отчёта

### 6. Статистика (StatsPage)
- **Путь**: `/statistics`
- **Функциональность**: Анализ результатов обработки
- **Компоненты**: Charts, Statistics
- **Состояние**: Метрики качества

### 7. Авторизация (LoginPage)
- **Путь**: `/login`
- **Функциональность**: Вход в систему
- **Компоненты**: LoginForm, RegisterForm
- **Состояние**: Токен авторизации

## Система навигации

### React Router конфигурация

```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
  <Route path="/preprocess" element={<ProtectedRoute><PreprocessPage /></ProtectedRoute>} />
  <Route path="/ocr" element={<ProtectedRoute><OcrPage /></ProtectedRoute>} />
  <Route path="/verify" element={<ProtectedRoute><VerifyPage /></ProtectedRoute>} />
  <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
  <Route path="/statistics" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
</Routes>
```

### Компонент Stepper

Отображает прогресс обработки с визуальными индикаторами:

```tsx
<Stepper
  currentStep={navigationState.currentStep}
  completedSteps={navigationState.completedSteps}
  steps={steps}
/>
```

### Навигация между этапами

- **Кнопки "Вперед/Назад"**: Автоматическое управление доступностью
- **Боковая панель**: Быстрый переход к любому доступному этапу
- **Прогресс-бар**: Визуализация текущего состояния

## UI/UX особенности

### Адаптивный дизайн

- **Мобильные устройства**: Стекинг компонентов, скрытие боковой панели
- **Планшеты**: Адаптивная сетка, оптимизированные размеры
- **Десктоп**: Полнофункциональный интерфейс с боковой панелью

### Компоненты shadcn/ui

- **Button**: Различные варианты (default, outline, ghost)
- **Card**: Контейнеры для контента
- **Progress**: Индикаторы прогресса
- **Stepper**: Навигация по этапам

### Цветовая схема

- **Основной**: Синий (#3B82F6)
- **Успех**: Зелёный (#10B981)
- **Ошибка**: Красный (#EF4444)
- **Предупреждение**: Жёлтый (#F59E0B)

## Управление состоянием

### Context API

1. **AuthContext**: Авторизация пользователя
2. **NavigationContext**: Навигация между этапами
3. **ProcessingContext**: Состояние обработки документов

### Hooks

- **useAuth**: Управление авторизацией
- **useNavigation**: Навигация между страницами
- **useProcessing**: Обработка документов

## Конфигурация bun

### package.json

```json
{
  "scripts": {
    "dev": "bun run --bun vite",
    "build": "bun run --bun vite build",
    "preview": "bun run --bun vite preview"
  }
}
```

### Зависимости

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.544.0",
    "tailwind-merge": "^3.3.1",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-separator": "^1.1.7"
  }
}
```

## Запуск приложения

### Установка зависимостей

```bash
bun install
```

### Запуск в режиме разработки

```bash
bun run dev
```

### Сборка для продакшена

```bash
bun run build
```

## Особенности реализации

### 1. Типизация TypeScript

- Строгая типизация всех компонентов
- Интерфейсы для состояний и пропсов
- Типы для этапов обработки

### 2. Производительность

- Lazy loading компонентов
- Мемоизация с React.memo
- Оптимизация ререндеров

### 3. Доступность (Accessibility)

- ARIA-атрибуты
- Клавиатурная навигация
- Семантическая разметка

### 4. Тестирование

- Unit тесты для компонентов
- Integration тесты для навигации
- E2E тесты для пользовательских сценариев

## Расширение функциональности

### Добавление нового этапа

1. Создать компонент страницы в `src/components/pages/`
2. Добавить маршрут в `App.tsx`
3. Обновить типы в `src/types/navigation.ts`
4. Добавить константы в `src/lib/constants.ts`

### Добавление нового UI-компонента

1. Создать компонент в `src/components/ui/`
2. Использовать shadcn/ui как основу
3. Добавить типы и варианты
4. Экспортировать из индексного файла

## Заключение

Архитектура UI обеспечивает:

- **Масштабируемость**: Легкое добавление новых этапов и компонентов
- **Поддерживаемость**: Чёткая структура и типизация
- **Производительность**: Оптимизированные компоненты и состояние
- **Пользовательский опыт**: Интуитивная навигация и адаптивный дизайн

Система готова к дальнейшему развитию и интеграции с backend API для полноценной обработки документов.
