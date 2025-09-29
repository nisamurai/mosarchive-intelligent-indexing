# Компонент статистики обработки документов

## Описание

Компонент `StatisticsComponent` предназначен для отображения статистики обработки документов в системе автоматического распознавания и индексирования архивных документов.

## Основные метрики

### 1. Обработано документов (processed_count)
- **Описание**: Количество успешно обработанных документов за выбранный период
- **Тип данных**: `number`
- **Источник**: База данных обработанных документов
- **Расчет**: Подсчет записей со статусом "completed" в таблице `processed_documents`

### 2. Средняя уверенность (avg_confidence)
- **Описание**: Средний уровень уверенности распознавания текста
- **Тип данных**: `number` (0.0 - 1.0)
- **Источник**: Поле `confidence` в результатах распознавания
- **Расчет**: Среднее арифметическое всех уровней уверенности распознавания

```sql
-- Пример SQL запроса для расчета средней уверенности
SELECT AVG(confidence) as avg_confidence 
FROM recognition_results 
WHERE document_id IN (
    SELECT id FROM processed_documents 
    WHERE status = 'completed' 
    AND created_at >= :start_date 
    AND created_at <= :end_date
);
```

### 3. Низкая уверенность (low_confidence_count)
- **Описание**: Количество элементов с низким уровнем уверенности распознавания
- **Тип данных**: `number`
- **Порог**: confidence < 0.7 (70%)
- **Расчет**: Подсчет элементов с уровнем уверенности ниже порогового значения

```sql
-- Пример SQL запроса для подсчета элементов с низкой уверенностью
SELECT COUNT(*) as low_confidence_count
FROM recognition_results 
WHERE confidence < 0.7
AND document_id IN (
    SELECT id FROM processed_documents 
    WHERE status = 'completed'
);
```

### 4. Среднее время обработки (processing_time_avg)
- **Описание**: Среднее время обработки одного документа в секундах
- **Тип данных**: `number`
- **Источник**: Поля `started_at` и `completed_at` в таблице `processing_logs`
- **Расчет**: Среднее время между началом и завершением обработки

```sql
-- Пример SQL запроса для расчета среднего времени обработки
SELECT AVG(
    EXTRACT(EPOCH FROM (completed_at - started_at))
) as processing_time_avg
FROM processing_logs 
WHERE status = 'completed'
AND completed_at IS NOT NULL;
```

## Дополнительные метрики

### Распределение по уровням уверенности
- **Высокая уверенность**: ≥ 90% (confidence ≥ 0.9)
- **Средняя уверенность**: 70-89% (0.7 ≤ confidence < 0.9)
- **Низкая уверенность**: < 70% (confidence < 0.7)

### Динамика по дням
- Статистика за последние 7 дней
- Количество обработанных документов по дням
- Средняя уверенность по дням
- Количество элементов с низкой уверенностью по дням

## Интеграция с бэкендом

### 1. Замена заглушечных данных

Замените функцию `generateMockStatistics()` на реальный API-вызов:

```typescript
// Замените это:
const generateMockStatistics = (): ProcessingStatistics => {
  return {
    processed_count: Math.floor(Math.random() * 50) + 10,
    // ... остальные поля
  };
};

// На это:
const fetchStatistics = async (): Promise<ProcessingStatistics> => {
  const response = await fetch('/api/statistics/processing');
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return response.json();
};
```

### 2. Обработка ошибок

Добавьте обработку ошибок и состояний загрузки:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const refreshStatistics = async () => {
  setIsRefreshing(true);
  setError(null);
  
  try {
    const stats = await fetchStatistics();
    setStatistics(stats);
    setLastRefresh(new Date());
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики');
  } finally {
    setIsRefreshing(false);
  }
};
```

### 3. Кэширование

Реализуйте кэширование для оптимизации производительности:

```typescript
// Простое кэширование в localStorage
const CACHE_KEY = 'statistics_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

const getCachedStatistics = (): ProcessingStatistics | null => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  
  return data;
};

const setCachedStatistics = (stats: ProcessingStatistics) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: stats,
    timestamp: Date.now()
  }));
};
```

### 4. Фильтры по датам и типам документов

Добавьте возможность фильтрации данных:

```typescript
interface StatisticsFilters {
  startDate?: Date;
  endDate?: Date;
  documentTypes?: string[];
  archiveIds?: string[];
}

const fetchFilteredStatistics = async (filters: StatisticsFilters): Promise<ProcessingStatistics> => {
  const params = new URLSearchParams();
  
  if (filters.startDate) {
    params.append('start_date', filters.startDate.toISOString());
  }
  if (filters.endDate) {
    params.append('end_date', filters.endDate.toISOString());
  }
  if (filters.documentTypes) {
    params.append('document_types', filters.documentTypes.join(','));
  }
  
  const response = await fetch(`/api/statistics/processing?${params}`);
  return response.json();
};
```

## API Endpoints

### GET /api/statistics/processing
Возвращает основную статистику обработки документов.

**Параметры запроса:**
- `start_date` (optional): Дата начала периода (ISO 8601)
- `end_date` (optional): Дата окончания периода (ISO 8601)
- `document_types` (optional): Типы документов (через запятую)

**Ответ:**
```json
{
  "processed_count": 150,
  "avg_confidence": 0.87,
  "low_confidence_count": 12,
  "total_elements": 1250,
  "high_confidence_count": 980,
  "medium_confidence_count": 258,
  "processing_time_avg": 25.5,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### GET /api/statistics/daily
Возвращает динамику по дням за последние 7 дней.

**Ответ:**
```json
[
  {
    "date": "2024-01-09",
    "processed_count": 18,
    "avg_confidence": 0.89,
    "low_confidence_count": 2
  },
  {
    "date": "2024-01-10",
    "processed_count": 22,
    "avg_confidence": 0.91,
    "low_confidence_count": 1
  }
  // ... остальные дни
]
```

## Производительность

### Оптимизация запросов
- Используйте индексы на полях `created_at`, `status`, `confidence`
- Кэшируйте результаты на уровне базы данных
- Ограничивайте период выборки данных

### Мониторинг
- Отслеживайте время выполнения запросов
- Логируйте ошибки API
- Мониторьте использование памяти

## Безопасность

### Аутентификация
- Требуйте аутентификации для доступа к статистике
- Используйте JWT токены или сессии

### Авторизация
- Проверяйте права доступа пользователя
- Ограничивайте доступ к чувствительным данным

### Валидация
- Валидируйте входные параметры
- Санитизируйте данные перед отображением

## Тестирование

### Unit тесты
```typescript
describe('StatisticsComponent', () => {
  it('should display correct statistics', () => {
    const mockStats = {
      processed_count: 100,
      avg_confidence: 0.85,
      low_confidence_count: 5,
      // ... остальные поля
    };
    
    render(<StatisticsComponent />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
```

### Integration тесты
- Тестируйте API endpoints
- Проверяйте корректность расчетов
- Тестируйте обработку ошибок

## Развертывание

### Переменные окружения
```env
STATISTICS_CACHE_TTL=300000
STATISTICS_API_BASE_URL=https://api.example.com
STATISTICS_REFRESH_INTERVAL=30000
```

### Конфигурация
- Настройте CORS для API
- Настройте rate limiting
- Настройте мониторинг и логирование

## Поддержка и обслуживание

### Логирование
- Логируйте все API вызовы
- Отслеживайте производительность
- Мониторьте ошибки

### Обновления
- Регулярно обновляйте зависимости
- Мониторьте безопасность
- Тестируйте изменения

### Резервное копирование
- Регулярно создавайте резервные копии данных
- Тестируйте процедуры восстановления
- Документируйте процессы
