# Модуль заглушек (Placeholders Module)

## Описание

Модуль `placeholders.py` предоставляет API для работы с текстовыми заглушками и примерами данных для сервиса.

## Принципы работы


### Архитектура взаимодействия

```
Frontend (React) → HTTP Request → Backend (FastAPI) → Placeholders Module → Response
                                                              ↓
                                                         Локальные
                                                         заглушки
```

## API Endpoints

### 1. Получить заглушки для отчётов
**GET** `/api/placeholders/report`

Возвращает заглушки и описания полей для отчётов.

**Ответ:**
```json
{
  "placeholders": {
    "fileName": "документ.pdf",
    "archiveCode": "01-0203-0745-000002",
    "recognizedText": "Распознанный текст документа...",
    "archiveId": "1",
    "fund": "203",
    "opis": "745",
    "delo": "2",
    "fio": "Иванов И.И.",
    "date": "15.03.2024",
    "documentNumber": "12345",
    "address": "г. Москва, ул. Примерная, д. 1",
    "organization": "Архивное учреждение",
    "fileSize": "2.5 MB",
    "status": "Обработан"
  },
  "descriptions": {
    "fileName": "Имя файла документа",
    "archiveCode": "Архивный код документа",
    ...
  }
}
```

### 2. Получить заглушки для статистики
**GET** `/api/placeholders/statistics`

Возвращает конфигурацию для генерации мок-статистики.

### 3. Сгенерировать мок-статистику
**GET** `/api/placeholders/statistics/mock`

Генерирует случайные данные статистики на основе предустановленных диапазонов.

**Ответ:**
```json
{
  "processed_count": 35,
  "avg_confidence": 0.875,
  "low_confidence_count": 5,
  "total_elements": 180,
  "high_confidence_count": 145,
  "medium_confidence_count": 35,
  "processing_time_avg": 22.5,
  "last_updated": "2024-03-15T14:30:00"
}
```

### 4. Получить ежедневную статистику
**GET** `/api/placeholders/statistics/daily`

Генерирует мок-данные ежедневной статистики за последние 7 дней.

**Ответ:**
```json
[
  {
    "date": "2024-03-09",
    "processed_count": 12,
    "avg_confidence": 0.92,
    "low_confidence_count": 2
  },
  ...
]
```

### 5. Получить текстовые заглушки
**GET** `/api/placeholders/text`

Возвращает заглушки для текстовых полей ввода.

**Ответ:**
```json
{
  "edit_placeholder": "Введите текст для редактирования...",
  "ocr_placeholder": "Текст будет доступен после OCR обработки...",
  "login_placeholder": "Введите логин",
  "password_placeholder": "Введите пароль",
  "email_placeholder": "Введите email",
  "confirm_password_placeholder": "Подтвердите пароль",
  "general_text_placeholder": "Введите текст..."
}
```

### 6. Получить заглушки статусов обработки
**GET** `/api/placeholders/processing-status`

Возвращает заглушки для статусов обработки файлов.

**Ответ:**
```json
{
  "completed": "Загружено",
  "processing": "Обработка",
  "error": "Ошибка",
  "pending": "Ожидание предобработки"
}
```

### 7. Получить все заглушки сразу
**GET** `/api/placeholders/all`

Возвращает все типы заглушек одним запросом.

### 8. Получить пример данных для отчёта
**GET** `/api/placeholders/report/sample`

Возвращает полный набор примерных данных для одного документа в отчёте.

## Использование на фронтенде

### Хук `usePlaceholders`

Frontend использует специальный хук для работы с заглушками:

```typescript
import { usePlaceholders } from '../hooks/usePlaceholders';

const MyComponent = () => {
  const { 
    getReportPlaceholder,
    getTextPlaceholder,
    getProcessingStatus,
    getMockStatistics,
    loading,
    error 
  } = usePlaceholders();

  // Использование заглушек
  const placeholder = getReportPlaceholder('fileName');
  const inputPlaceholder = getTextPlaceholder('login_placeholder');
  const status = getProcessingStatus('completed');
  
  // Асинхронная загрузка мок-данных
  const stats = await getMockStatistics();
};
```

### Fallback режим

Хук `usePlaceholders` имеет встроенную поддержку fallback режима. Если бэкенд недоступен, используются локальные заглушки:

```typescript
try {
  const data = await fetch('/api/placeholders/all');
  // Используем данные с бэкенда
} catch (error) {
  // Fallback к локальным заглушкам
  // Система продолжает работать
}
```

## Компоненты, использующие заглушки

### 1. ReportConstructor
Использует заглушки для примеров данных в отчётах:
- `getReportPlaceholder()` - для значений полей
- `getReportFieldDescription()` - для описаний полей

### 2. StatisticsComponent
Использует мок-статистику:
- `getMockStatistics()` - основная статистика
- `getMockDailyStatistics()` - ежедневная динамика

### 3. VerifyPage
Использует заглушки для текстовых полей:
- `getTextPlaceholder('edit_placeholder')`
- `getTextPlaceholder('ocr_placeholder')`

### 4. UploadPage
Использует заглушки статусов:
- `getProcessingStatus(status)`

### 5. LoginForm & RegisterForm
Используют заглушки для полей ввода:
- `getTextPlaceholder('login_placeholder')`
- `getTextPlaceholder('password_placeholder')`
- `getTextPlaceholder('email_placeholder')`

## Преимущества архитектуры

### 1. Централизованное управление
Все заглушки находятся в одном месте, что упрощает:
- Обновление текстов
- Локализацию
- Поддержку кодовой базы

### 2. Оффлайн работа
Система полностью автономна и работает без интернета

### 3. Типизация
TypeScript обеспечивает типобезопасность при работе с заглушками

### 4. Graceful degradation
При недоступности бэкенда система использует локальные fallback заглушки

## Расширение

Для добавления новых заглушек:

1. Добавьте заглушку в `backend/placeholders.py`:
```python
MY_PLACEHOLDERS = {
    "new_field": "Новое значение"
}
```

2. Создайте endpoint:
```python
@router.get("/my-endpoint")
async def get_my_placeholders():
    return MY_PLACEHOLDERS
```

3. Обновите хук `usePlaceholders.ts`:
```typescript
const getMyPlaceholder = (key: string): string => {
  return placeholders?.my[key] || 'Значение по умолчанию';
};
```

## Тестирование

Проверка импорта модуля:
```bash
cd backend
python -c "from placeholders import router; print('OK')"
```

Проверка работы API:
```bash
# Запустить сервер
python start_backend_full.py

# В другом терминале
curl http://localhost:8000/api/placeholders/all
```
