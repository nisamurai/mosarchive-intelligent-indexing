# Сопроводительная документация
## Веб-сервис MosArchive Intelligent Indexing

## 1. Введение

### 1.1 Обзор проекта

MosArchive Intelligent Indexing представляет собой веб-сервис с применением средств искусственного интеллекта для автоматизированного извлечения данных из образов архивных документов, их индексирования и наполнения базы данных.

**Основная цель проекта:** Создание удобной и масштабируемой платформы для обработки архивных документов с возможностью интеграции различных алгоритмов ИИ и машинного обучения.


 - Возможность ручной загрузки документов, запуска алгоритмов предобработки изображений и алгоритмов распознавания текста.

  - Наличие этапа верификации для оценки правильности распознования текста с функцией ручной правки и возможностью цветного отображения распознонных атрибутов прямо в тексте.

 - Конструктор отчёта предоставляет гибкую систему для экспорта данных обработанных документов:

    -  **Выбор полей** из 13+ доступных вариантов
    - **Готовые шаблоны** для быстрого создания отчётов
    - **Предварительный просмотр** структуры данных
    - **Экспорт в CSV** с корректной кодировкой для Excel
    - **Статистика** по экспортируемым данным
    - **Расширяемость** новыми полями и шаблонами

### 1.2 Область применения

Система предназначена для:
- Автоматизированной обработки архивных документов
- Извлечения структурированных данных из неструктурированных текстов
- Верификации и корректировки результатов распознавания
- Генерации отчетов в различных форматах
- Статистического анализа качества обработки

---
### 1.3 Объем решаемых задач

**Реализованный функционал:**
-  Веб-интерфейс для загрузки и обработки документов
-  Модульная архитектура для интеграции ИИ-алгоритмов
-  Система верификации результатов с ручной корректировкой
-  Конструктор отчетов с экспортом в CSV
-  Система авторизации и управления пользователями
-  Статистический анализ обработки документов
-  Docker-контейнеризация для развертывания

**Планируемая интеграция ИИ-алгоритмов:**
- Алгоритмы предобработки изображений (deskew, denoising, binarization)
- OCR-движки для распознавания текста
- NER-модели для извлечения именованных сущностей
- ML-модели для классификации документов

---

## 2. Архитектура системы

### 2.1 Общая архитектура

Система построена по принципу микросервисной архитектуры с четким разделением на фронтенд и бэкенд компоненты:

## Архитектура взаимодействия

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Страницы   │  │   Компоненты │  │   Контексты  │       │
│  │              │  │              │  │              │       │
│  │ • LoginPage  │  │ • UploadComp │  │ • AuthContext│       │
│  │ • UploadPage │  │ • VerifyPage │  │ • Navigation │       │
│  │ • Preprocess │  │ • ReportCons │  │ • Processing │       │
│  │ • OcrPage    │  │ • Statistics │  │              │       │
│  │ • VerifyPage │  │ • AuthPage   │  │              │       │
│  │ • ReportPage │  │ • Header     │  │              │       │
│  │ • StatsPage  │  │ • Layout     │  │              │       │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘       │
│         │                 │                                 │
│  ┌──────▼──────┐   ┌──────▼──────┐  ┌──────────────┐        │
│  │    Хуки     │   │   Утилиты   │  │     Типы     │        │
│  │             │   │             │  │              │        │
│  │ • useAuth   │   │ • csvExport │  │ • navigation │        │
│  │ • useNav    │   │ • reportExp │  │ • processing │        │
│  │ • usePlaceh │   │ • archiveUt │  │ • report     │        │
│  │ • useProc   │   │ • docAdapter│  │              │        │
│  └──────┬──────┘   └──────┬──────┘  └──────────────┘        │
│         │                 │                                 │
│         └────────┬────────┘                                 │
│                  │ HTTP Requests                            │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   main.py                              │ │
│  │              (FastAPI Application)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                             │                               │
│    ┌────────────────────────┼────────────────────────┐      │
│    ▼            ▼           ▼           ▼            ▼      │
│  ┌──────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │upload│  │preproc │  │   ocr  │  │attrib  │  │placeho │   │
│  │.py   │  │.py     │  │.py     │  │.py     │  │.py     │   │
│  └──────┘  └────────┘  └────────┘  └────────┘  └────┬───┘   │
│                                                     │       │
│  ┌──────┐  ┌────────┐  ┌────────┐  ┌────────┐       │       │
│  │report│  │ stats  │  │  auth  │  │ image  │       │       │
│  │.py   │  │.py     │  │_backend│  │_process│       │       │
│  └──────┘  └────────┘  └────────┘  └────────┘       │       │
│                                                     │       │
│                                           ┌─────────▼─────┐ │
│                                           │   Локальные   │ │
│                                           │   заглушки    │ │
│                                           │   (мок-данные)│ │
│                                           └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Ключевые модули

### Frontend
- **Страницы** — LoginPage, UploadPage, PreprocessPage, OcrPage, VerifyPage, ReportPage, StatsPage
- **Компоненты** — UploadComponent, VerifyPage, ReportConstructor, StatisticsComponent, AuthPage, Header, Layout, Navigation, Sidebar, ProgressBar
- **UI-компоненты** — button, card, progress, stepper (shadcn/ui)
- **Контексты** — AuthContext, NavigationContext, ProcessingContext
- **Хуки** — useAuth, useNavigation, usePlaceholders, useProcessing
- **Утилиты** — csvExport, reportExport, archiveUtils, documentDataAdapter

### Backend
- **main.py** — главный файл FastAPI приложения
- **upload.py** — модуль загрузки файлов
- **preprocess.py** — модуль предобработки изображений
- **ocr.py** — модуль распознавания текста
- **attributes.py** — модуль извлечения атрибутов
- **report.py** — модуль генерации отчётов
- **stats.py** — модуль статистики обработки
- **placeholders.py** — модуль заглушек для оффлайн работы
- **auth_backend.py** — модуль авторизации и аутентификации
- **image_processing.py** — обработка изображений
- **attribute_recognition.py** — распознавание атрибутов

## Структура проекта

```
mosarchive-intelligent-indexing/
├── frontend/                         # React приложение
│   ├── src/
│   │   ├── components/               # React компоненты
│   │   │   ├── pages/                # Страницы приложения
│   │   │   ├── layout/               # Компоненты макета
│   │   │   ├── ui/                   # UI-компоненты shadcn/ui
│   │   │   ├── common/               # Общие компоненты
│   │   │   ├── UploadComponent.tsx   # Основной компонент загрузки
│   │   │   ├── VerifyPage.tsx        # Компонент верификации
│   │   │   ├── ReportConstructor.tsx # Конструктор отчетов
│   │   │   ├── StatisticsComponent.tsx # Компонент статистики
│   │   │   ├── AuthPage.tsx          # Страница авторизации
│   │   │   ├── Header.tsx            # Заголовок
│   │   │   ├── LoginForm.tsx         # Форма входа
│   │   │   ├── RegisterForm.tsx      # Форма регистрации
│   │   │   ├── ProtectedRoute.tsx    # Защищенный маршрут
│   │   │   └── AttributeHighlightedText.tsx # Подсветка атрибутов
│   │   ├── contexts/                 # React Context
│   │   │   ├── AuthContext.tsx       # Контекст авторизации
│   │   │   ├── NavigationContext.tsx # Контекст навигации
│   │   │   └── ProcessingContext.tsx # Контекст обработки
│   │   ├── hooks/                    # Пользовательские хуки
│   │   │   ├── useAuth.ts            # Хук авторизации
│   │   │   ├── useNavigation.ts      # Хук навигации
│   │   │   ├── usePlaceholders.ts    # Хук заглушек
│   │   │   └── useProcessing.ts      # Хук обработки
│   │   ├── lib/                      # Утилиты и константы
│   │   │   ├── utils.ts              # Утилиты (cn функция для Tailwind)
│   │   │   ├── constants.ts          # Константы
│   │   │   ├── archiveUtils.ts       # Утилиты для архивов
│   │   │   ├── csvExport.ts          # Экспорт в CSV
│   │   │   ├── reportExport.ts       # Экспорт отчетов
│   │   │   ├── documentDataAdapter.ts # Адаптер данных документов
│   │   │   ├── image_processing.py   # Модуль обработки изображений
│   │   │   ├── attribute_recognition.py # Модуль распознавания атрибутов
│   │   │   └── auth_backend.py       # Backend авторизации
│   │   ├── types/                    # TypeScript типы
│   │   │   ├── navigation.ts         # Типы навигации
│   │   │   ├── processing.ts         # Типы обработки
│   │   │   └── report.ts             # Типы отчетов
│   │   ├── App.tsx                   # Главный компонент приложения
│   │   ├── main.tsx                  # Точка входа
│   │   └── index.css                 # Глобальные стили
│   ├── package.json                  # Зависимости Node.js
│   ├── vite.config.ts                # Конфигурация Vite
│   ├── tailwind.config.js            # Конфигурация Tailwind
│   ├── tsconfig.json                 # Конфигурация TypeScript
│   └── Dockerfile                    # Docker образ для фронтенда
├── backend/                          # Python FastAPI приложение
│   ├── main.py                       # Главный файл FastAPI
│   ├── upload.py                     # Модуль загрузки файлов
│   ├── preprocess.py                 # Модуль предобработки
│   ├── ocr.py                        # Модуль OCR
│   ├── attributes.py                 # Модуль атрибутов
│   ├── report.py                     # Модуль отчетов
│   ├── stats.py                      # Модуль статистики
│   ├── placeholders.py               # Модуль заглушек
│   ├── auth_backend.py               # Модуль авторизации
│   ├── image_processing.py           # Обработка изображений
│   ├── attribute_recognition.py      # Распознавание атрибутов
│   ├── start_backend_full.py         # Скрипт запуска
│   ├── requirements.txt              # Python зависимости
│   ├── Dockerfile                    # Docker образ для бэкенда
│   ├── uploads/                      # Загруженные файлы
│   ├── processed/                    # Обработанные файлы
│   ├── ocr_results/                  # Результаты OCR
│   ├── attribute_results/            # Результаты атрибутов
│   ├── reports/                      # Сгенерированные отчеты
│   └── logs/                         # Логи приложения
├── documentation/                    # Документация проекта
│   ├── frontend/                     # Документация фронтенда
│   ├── backend/                      # Документация бэкенда
│   ├── INSTALLATION.md               # Инструкции по установке
│   ├── ARCHITECTURE.md               # Архитектура системы
│   ├── COMPONENTS.md                 # Компоненты
│   ├── DEVELOPMENT.md                # Разработка
│   ├── DOCKER.md                     # Docker-инфраструктура
│   └── UI_ARCHITECTURE.md            # UI-архитектура
├── docker-compose.yml                # Конфигурация Docker Compose
├── nginx-mosarchive.conf             # Конфигурация Nginx
├── setup_public_server.sh            # Скрипт настройки сервера
└── README.md                         # Главная документация
```

## Особенности реализации

### Frontend
1. **Многостраничное приложение**: 7 основных страниц с роутингом
2. **Модульная архитектура**: Разделение на компоненты, контексты, хуки и утилиты
3. **Система авторизации**: JWT токены, защищенные маршруты
4. **Drag-and-drop загрузка**: Интуитивный интерфейс загрузки файлов
5. **Верификация результатов**: Интерактивное редактирование распознанного текста
6. **Конструктор отчетов**: Гибкая система экспорта в CSV
7. **Статистика обработки**: Визуализация метрик качества
8. **Адаптивный дизайн**: Работа на всех устройствах
9. **Accessibility**: 
   - ARIA-атрибуты для скрин-ридеров
   - Семантическая разметка
   - Focus-индикаторы для кнопок
   - Альтернативный текст для изображений

### Backend
1. **RESTful API**: Стандартизированные endpoints для всех операций
2. **Модульная структура**: Независимые модули для каждого этапа обработки
3. **Система заглушек**: Оффлайн работа с мок-данными
4. **Валидация данных**: Pydantic модели для валидации
5. **Логирование**: Подробные логи всех операций
6. **CORS поддержка**: Кросс-доменные запросы
7. **JWT аутентификация**: Безопасная авторизация
8. **Файловое хранилище**: Организованное хранение загруженных и обработанных файлов

## Модуль заглушек (Placeholders)

Система использует специальный модуль `backend/placeholders.py`, который предоставляет:
- Текстовые заглушки для интерфейса
- Примеры данных для отчётов
- Мок-статистику для тестирования
- Статусы обработки файлов

## Заглушки для ИИ

В текущей версии все вызовы ИИ заменены заглушками:
- Загрузка файлов симулируется с задержкой
- Обработка документов выводится в консоль
- В будущем здесь будут реальные вызовы API ИИ

### 2.2 Технологический стек

**Frontend:**
- React 19 + TypeScript
- Vite (сборщик)
- Tailwind CSS (стилизация)
- shadcn/ui + Radix UI (UI-компоненты)
- React Router DOM (роутинг)
- Lucide React (иконки)
- Bun (пакетный менеджер)

**Backend:**
- Python 3.8+
- FastAPI (веб-фреймворк)
- Pydantic (валидация данных)
- JWT (аутентификация)
- Uvicorn (ASGI-сервер)

**Инфраструктура:**
- Docker + Docker Compose
- Nginx (обратный прокси)
- PostgreSQL (планируется)

---
### 2.3 Модульная архитектура

Архитектура веб-приложения детально продумана и проработана. Весь функционал абстрагирован и распределен по отдельным модулям. Это гарантирует удобную и независимую интеграцию реальных зависимостей в каждый модуль.

### 2.3.1 Frontend модули

**1. UploadComponent**
- Drag-and-drop интерфейс загрузки
- Прогресс-бар и валидация файлов
- Поддержка множественного выбора

**2. VerifyPage**
- Интерактивная верификация результатов
- Редактирование распознанного текста
- Масштабирование и поворот изображений
- Подсветка изменений

**3. ReportConstructor**
- Конструктор отчетов с выбором полей
- Предустановленные шаблоны
- Предварительный просмотр данных
- Экспорт в CSV с корректной кодировкой

**4. StatisticsComponent**
- Отображение статистики обработки
- Метрики качества распознавания
- Динамика по дням

**5. AuthPage**
- Формы входа и регистрации
- Валидация данных
- Управление сессиями

### 2.3.2 Backend модули

**1. Upload Module (`/upload`)**
- Загрузка и управление файлами документов
- Валидация форматов (JPG, JPEG, TIFF, PDF)
- Обработка множественных файлов
- Endpoints: `POST /upload/file`, `POST /upload/files`, `GET /upload/files`

**2. Preprocess Module (`/preprocess`)**
- Предобработка изображений для улучшения качества
- Абстракция для интеграции алгоритмов: deskew, denoising, binarization
- Endpoints: `GET /preprocess/steps`, `POST /preprocess/process`

**3. OCR Module (`/ocr`)**
- Распознавание текста на изображениях
- Поддержка различных языков и моделей
- Endpoints: `GET /ocr/languages`, `POST /ocr/recognize`

**4. Attributes Module (`/attributes`)**
- Извлечение структурированных атрибутов из текста
- NER для ФИО, дат, адресов, архивных шифров
- Endpoints: `GET /attributes/types`, `POST /attributes/extract`

**5. Report Module (`/report`)**
- Генерация отчетов в различных форматах
- Экспорт в CSV, JSON, PDF
- Endpoints: `GET /report/types`, `POST /report/generate`

**6. Statistics Module (`/stats`)**
- Статистика по работе системы
- Метрики качества обработки
- Endpoints: `GET /stats/overview`, `GET /stats/processing`

**7. Auth Module (`/auth`)**
- Аутентификация и авторизация пользователей
- JWT токены, хеширование паролей
- Endpoints: `POST /register`, `POST /login`, `GET /me`

**8. Placeholders Module (`/api/placeholders`)**
- Локальные заглушки
- Мок-данные для тестирования
- Endpoints: `GET /api/placeholders/all`, `GET /api/placeholders/report`

---
<div style="page-break-after: always;"></div>

## 3. Алгоритм работы системы

### 3.1 Общий workflow

1. **Авторизация пользователя**
   - Вход в систему через форму авторизации
   - Получение JWT токена
   - Сохранение сессии в localStorage

2. **Загрузка документов**
   - Drag-and-drop или выбор файлов
   - Валидация форматов и размеров
   - Отображение прогресса загрузки

3. **Предобработка изображений** (пока стоят функции-заглушки)
   - Выбор алгоритмов предобработки
   - Применение фильтров (deskew, denoising, binarization)
   - Сохранение промежуточных результатов

4. **OCR обработка** (пока стоят функции-заглушки)
   - Распознавание текста с помощью OCR-движка
   - Извлечение текстового содержимого
   - Расчет уровня уверенности

5. **Извлечение атрибутов** (пока стоят функции-заглушки)
   - NER для поиска именованных сущностей
   - Извлечение ФИО, дат, адресов, архивных шифров
   - Структурирование данных

6. **Верификация результатов**
   - Отображение распознанного текста
   - Возможность ручной корректировки
   - Подсветка изменений
   - Сохранение исправлений

7. **Генерация отчетов**
   - Выбор полей для экспорта
   - Применение шаблонов
   - Экспорт в CSV/JSON/PDF

8. **Статистический анализ**
   - Просмотр метрик качества
   - Анализ производительности
   - Отчеты по обработке

<div style="page-break-after: always;"></div>

### 3.2 Детализированные алгоритмы

#### 3.2.1 Алгоритм предобработки изображений

```python
class ImageProcessor:
    def process_document(self, image, steps):
        """
        Обработка документа с применением выбранных алгоритмов
        """
        for step in steps:
            if step == 'correct_perspective':
                image = self.correct_perspective(image)
            elif step == 'align_image':
                image = self.align_image(image)
            elif step == 'enhance_contrast':
                image = self.enhance_contrast(image)
            elif step == 'remove_noise':
                image = self.remove_noise(image)
            elif step == 'binarize_image':
                image = self.binarize_image(image)
        return image
```

**Планируемые алгоритмы:**
- **Deskew (выравнивание)**: Hough Transform для определения угла наклона
- **Denoising (удаление шума)**: Медианный фильтр, Gaussian blur
- **Binarization (бинаризация)**: Otsu thresholding, Adaptive thresholding
- **Perspective correction**: Corner detection + perspective transform

#### 3.2.2 Алгоритм извлечения атрибутов

```python
def extract_attributes(text):
    """
    Извлечение структурированных атрибутов из текста
    """
    attributes = {
        'fio': extract_fio(text),
        'date': extract_dates(text),
        'address': extract_addresses(text),
        'archive_code': extract_archive_codes(text),
        'document_number': extract_document_numbers(text),
        'organization': extract_organizations(text)
    }
    return attributes
```

**Регулярные выражения:**
- **ФИО**: `[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.`
- **Даты**: `\d{1,2}\.\d{1,2}\.\d{4}`
- **Архивные коды**: `\d{2}-\d{4}-\d{4}-\d{6}`
- **Номера документов**: `Дело\s*№\s*\d+`

**Планируемые ML-модели:**
- **spaCy NER** для русского языка
- **BERT-based models** для извлечения сущностей
- **Custom CRF models** для архивных документов

#### 3.2.3 Алгоритм верификации

```typescript
interface TextValidationInfo {
  hasChanges: boolean;
  originalLength: number;
  editedLength: number;
  validationErrors: string[];
}

const validateText = (original: string, edited: string): TextValidationInfo => {
  const validationErrors: string[] = [];
  
  if (edited.trim() === '') {
    validationErrors.push('Текст не может быть пустым');
  }
  
  const lengthRatio = edited.length / original.length;
  if (lengthRatio < 0.5) {
    validationErrors.push('Текст стал значительно короче оригинала');
  }
  
  if (lengthRatio > 2.0) {
    validationErrors.push('Текст стал значительно длиннее оригинала');
  }
  
  return {
    hasChanges: original !== edited,
    originalLength: original.length,
    editedLength: edited.length,
    validationErrors
  };
};
```

---
<div style="page-break-after: always;"></div>

## 4. Применяемые методы

### 4.1 Готовые реализации

**Frontend библиотеки:**
- **React 19**: https://react.dev/ - библиотека для создания пользовательских интерфейсов
- **TypeScript**: https://www.typescriptlang.org/ - типизированный JavaScript
- **Tailwind CSS**: https://tailwindcss.com/ - utility-first CSS фреймворк
- **shadcn/ui**: https://ui.shadcn.com/ - компоненты на основе Radix UI
- **React Router**: https://reactrouter.com/ - маршрутизация для React
- **Lucide React**: https://lucide.dev/ - иконки для React

**Backend библиотеки:**
- **FastAPI**: https://fastapi.tiangolo.com/ - современный веб-фреймворк для Python
- **Pydantic**: https://pydantic-docs.helpmanual.io/ - валидация данных
- **Uvicorn**: https://www.uvicorn.org/ - ASGI-сервер
- **Python-JOSE**: https://python-jose.readthedocs.io/ - JWT токены

**Инфраструктура:**
- **Docker**: https://www.docker.com/ - контейнеризация приложений
- **Nginx**: https://nginx.org/ - веб-сервер и обратный прокси

### 4.2 Собственные реализации

**1. Модульная архитектура**
- Абстракция для интеграции ИИ-алгоритмов
- Независимые модули для каждого этапа обработки
- Единообразный API для всех модулей

**2. Система заглушек**
- Локальные заглушки
- Мок-данные для тестирования
- Graceful degradation при недоступности сервисов

**3. Валидация и обработка ошибок**
- Комплексная валидация на клиенте и сервере
- Понятные сообщения об ошибках
- Обработка сетевых сбоев

**4. Управление состоянием**
- React Context для глобального состояния
- Локальное состояние компонентов
- Синхронизация между компонентами

---

## 5. Инструкция по развертыванию

### 5.1 Системные требования

**Минимальные требования:**
- CPU: 2 ядра
- RAM: 4 GB
- Диск: 20 GB свободного места
- ОС: Linux (Ubuntu 20.04+), Windows 10+, macOS 10.15+

**Рекомендуемые требования:**
- CPU: 4+ ядер
- RAM: 8+ GB
- Диск: 50+ GB SSD
- ОС: Linux (Ubuntu 22.04 LTS)

### 5.2 Установка зависимостей

#### 5.2.1 Установка Docker

**Ubuntu/Debian:**
```bash
# Обновление пакетов
sudo apt update

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Windows:**
1. Скачать Docker Desktop с https://www.docker.com/products/docker-desktop
2. Установить и запустить Docker Desktop
3. Включить WSL 2 integration

**macOS:**
1. Скачать Docker Desktop с https://www.docker.com/products/docker-desktop
2. Установить и запустить Docker Desktop

#### 5.2.2 Установка Bun (для разработки)

**Linux/macOS:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
irm bun.sh/install.ps1 | iex
```

### 5.3 Развертывание через Docker

#### 5.3.1 Клонирование репозитория

```bash
git clone https://github.com/nisamurai/mosarchive-intelligent-indexing.git
cd mosarchive-intelligent-indexing
```

#### 5.3.2 Сборка и запуск

```bash
# Сборка всех образов
docker-compose build

# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps
```

#### 5.3.3 Проверка работы

После запуска сервисы будут доступны по адресам:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

#### 5.3.4 Остановка сервисов

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Остановка с удалением образов
docker-compose down --rmi all
```

### 5.4 Развертывание для разработки

#### 5.4.1 Backend

```bash
# Переход в директорию backend
cd backend

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/macOS
# или
venv\Scripts\activate     # Windows

# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
python start_backend_full.py
```

#### 5.4.2 Frontend

```bash
# Переход в директорию frontend
cd frontend

# Установка зависимостей
bun install

# Запуск в режиме разработки
bunx vite
```

<div style="page-break-after: always;"></div>

### 5.5 Конфигурация

#### 5.5.1 Переменные окружения

Создать файл `.env` в корне проекта:

```env
# Backend
PYTHONPATH=/app
PYTHONUNBUFFERED=1
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

#### 5.5.2 Настройка портов

Изменить порты в `docker-compose.yml` при необходимости:

```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Изменить на свободный порт
  backend:
    ports:
      - "8001:8000"  # Изменить на свободный порт
```

### 5.6 Мониторинг и логирование

#### 5.6.1 Просмотр логов

```bash
# Логи всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs frontend
docker-compose logs backend

# Следить за логами в реальном времени
docker-compose logs -f
```

#### 5.6.2 Проверка здоровья сервисов

```bash
# Проверка backend
curl http://localhost:8000/health

# Проверка frontend
curl http://localhost:3000
```

### 5.7 Резервное копирование

#### 5.7.1 Backup данных

```bash
# Создание backup volumes
docker run --rm -v mosarchive_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Восстановление из backup
docker run --rm -v mosarchive_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

---

## 6. Документация проекта

### 6.1 Структура документации

Документация детально проработана: главный файл `README.md` в корне проекта ссылается на документацию каждого важного модуля бэкенда (`documentation/backend`) и аналогично с фронтендом.

```
documentation/
├── INSTALLATION.md          # Подробные инструкции по установке
├── ARCHITECTURE.md          # Архитектура системы
├── COMPONENTS.md            # Компоненты
├── DEVELOPMENT.md           # Разработка
├── DOCKER.md                # Docker-инфраструктура
├── UI_ARCHITECTURE.md       # UI-архитектура
├── frontend/                # Frontend модули
│   ├── README_image_processing.md
│   ├── README_attribute_recognition.md
│   ├── README_verification_module.md
│   ├── README_statistics_component.md
│   ├── README_auth.md
│   └── README_report_constructor.md
└── backend/                 # Backend модули
    ├── README.md
    └── README_placeholders.md
```

<div style="page-break-after: always;"></div>


### 6.2 Основные разделы документации

**1. README.md** - Главная документация проекта
- Описание проекта и технологий
- Быстрый старт
- Ссылки на детальную документацию

**2. ARCHITECTURE.md** - Архитектура системы
- Общая архитектура
- Технологический стек
- Модульная структура

**3. INSTALLATION.md** - Установка и запуск
- Предварительные требования
- Пошаговая установка
- Решение проблем

**4. DOCKER.md** - Docker-инфраструктура
- Конфигурация контейнеров
- Команды для управления
- Мониторинг и логирование

**5. Frontend документация** - Документация фронтенд модулей
- Описание каждого компонента
- API и интерфейсы
- Примеры использования

**6. Backend документация** - Документация бэкенд модулей
- Описание API endpoints
- Модели данных
- Алгоритмы обработки

---
<div style="page-break-after: always;"></div>


## 7. Планы развития

### 7.1 Интеграция ИИ-алгоритмов

**Краткосрочные планы:**
- Интеграция Tesseract OCR для распознавания текста
- Реализация алгоритмов предобработки изображений (OpenCV)
- Добавление spaCy NER для извлечения сущностей
- Интеграция с внешними OCR API (Google Vision, Azure Cognitive Services)

**Среднесрочные планы:**
- Обучение собственных ML-моделей для архивных документов
- Интеграция BERT-based моделей для извлечения атрибутов
- Реализация системы машинного обучения для улучшения качества
- Добавление поддержки различных языков и шрифтов

**Долгосрочные планы:**
- Разработка собственных нейронных сетей для OCR
- Интеграция с системами компьютерного зрения
- Реализация автоматического обучения на новых документах
- Создание API для интеграции с внешними системами

### 7.2 Расширение функциональности

**Дополнительные модули:**
- Система версионирования документов
- Интеграция с внешними архивами
- Система уведомлений и оповещений
- Расширенная аналитика и отчетность

**Улучшения UX/UI:**
- Мобильная версия приложения
- Офлайн режим работы
- Расширенные возможности редактирования
- Система аннотаций и комментариев

---
<div style="page-break-after: always;"></div>


## 8. Заключение

### 8.1 Достигнутые результаты

MosArchive Intelligent Indexing представляет собой платформу для обработки архивных документов с модульной архитектурой, готовой для интеграции различных алгоритмов ИИ и машинного обучения.

**Ключевые достижения:**
- Создана масштабируемая архитектура с четким разделением модулей
- Разработана система верификации с возможностью ручной корректировки
- Создан конструктор отчетов с экспортом в различные форматы
- Реализована система авторизации и управления пользователями
- Настроена Docker-инфраструктура для развертывания
- Создана подробная документация для всех компонентов

### 8.2 Готовность к интеграции ИИ

Архитектура системы специально спроектирована для легкой интеграции алгоритмов ИИ:

- **Абстракция модулей** - каждый этап обработки изолирован и может быть заменен
- **Единообразный API** - стандартизированные интерфейсы для всех модулей
- **Система заглушек** - возможность работы без реальных алгоритмов
- **Модульная структура** - независимая разработка и тестирование компонентов

### 8.3 Возможности воспроизведения


- **Подробные инструкции по установке** - пошаговое руководство для развертывания
- **Docker-контейнеризация** - единообразная среда выполнения
- **Полная документация** - описание всех компонентов и алгоритмов
- **Примеры использования** - готовые сценарии для тестирования

**Дополнительная информация:**
- Документация: https://github.com/nisamurai/mosarchive-intelligent-indexing
- Демо-версия: http://85.159.231.195
- Тестовые учетные данные: L: `user` P: `user123`
