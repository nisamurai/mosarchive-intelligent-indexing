# Модуль предобработки изображений

Этот модуль содержит заглушки функций для предобработки изображений документов в системе интеллектуального индексирования архивов.

## Структура проекта

```
src/
├── lib/
│   ├── image_processing.py    # Основной модуль с функциями обработки
│   └── utils.ts              # Утилиты для React
├── components/
│   └── UploadComponent.tsx   # React компонент с индикаторами обработки
└── ...

documentation/
└── README_image_processing.md    # Документация модуля
```

## Функции предобработки

### Основные функции

1. **`align_image(image)`** - Выравнивание изображения (deskew)
2. **`enhance_contrast(image)`** - Коррекция контрастности
3. **`remove_noise(image)`** - Удаление шума
4. **`binarize_image(image)`** - Бинаризация (черно-белое)
5. **`correct_perspective(image)`** - Коррекция перспективы
6. **`enhance_resolution(image)`** - Улучшение разрешения
7. **`remove_background(image)`** - Удаление фона

### Класс ImageProcessor

Класс `ImageProcessor` предоставляет более продвинутый интерфейс:

```python
from src.lib.image_processing import ImageProcessor

# Создание процессора
processor = ImageProcessor()

# Обработка с кастомными этапами
processed_image = processor.process_document(
    image, 
    ['correct_perspective', 'align_image', 'enhance_contrast', 'remove_noise']
)

# Получение лога обработки
log = processor.get_processing_log()
```

## Примеры использования

### Простое использование отдельных функций

```python
from src.lib.image_processing import align_image, enhance_contrast, remove_noise

# Загружаем изображение
image = load_image('doc1.jpg')
print("До обработки:", image)

# Применяем функции
image = align_image(image)      # Prints: "Выполняется выравнивание..."
image = enhance_contrast(image) # Prints: "Повышаем контрастность..."
image = remove_noise(image)     # Prints: "Удаляем шум..."

print("После обработки:", image)
```

### Использование класса ImageProcessor

```python
from src.lib.image_processing import ImageProcessor

# Создаем процессор
processor = ImageProcessor()

# Определяем этапы обработки
steps = [
    'correct_perspective',  # Коррекция перспективы
    'align_image',          # Выравнивание
    'enhance_contrast',     # Улучшение контрастности
    'remove_noise',         # Удаление шума
    'binarize_image',       # Бинаризация
    'enhance_resolution'    # Улучшение разрешения
]

# Обрабатываем изображение
processed_image = processor.process_document(image, steps)

# Выводим лог
for log_entry in processor.get_processing_log():
    print(log_entry)
```

## UI/UX индикаторы

React компонент `UploadComponent` включает:

### Индикаторы обработки
- **Спиннер** во время обработки
- **Прогресс-бар** для общего прогресса
- **Детальная информация** по каждому файлу
- **Лог этапов** в реальном времени

### Статусы файлов
- `pending` - Ожидает обработки
- `uploading` - Загружается
- `processing` - Обрабатывается
- `completed` - Завершено
- `error` - Ошибка

### Визуальные элементы
- Анимированные спиннеры
- Цветовая индикация статусов
- Прогресс-бары с процентами
- Сворачиваемые логи обработки

## Тестирование модуля

Модуль можно протестировать, импортировав функции и классы:

```python
# Тестирование отдельных функций
from src.lib.image_processing import align_image, enhance_contrast, remove_noise

# Тестирование класса ImageProcessor
from src.lib.image_processing import ImageProcessor
```

## Планы развития

### Реальная реализация функций

Каждая функция содержит TODO комментарии с описанием будущей реализации:

```python
def align_image(self, image: Any) -> Any:
    """
    Выравнивание изображения (deskew)
    """
    self._log_step("Выполняется выравнивание изображения...")
    
    # TODO: Здесь будет настоящая обработка
    # - Определение угла наклона документа
    # - Поворот изображения для выравнивания
    # - Использование алгоритмов Hough Transform или Radon Transform
    
    time.sleep(0.5)  # Имитация времени обработки
    return image
```

### Необходимые зависимости

Для реальной работы потребуется установить:

```bash
pip install Pillow numpy opencv-python scikit-image
```

### Интеграция с бэкендом

- API endpoints для обработки изображений
- WebSocket для real-time обновлений прогресса
- Очередь задач для пакетной обработки
- Кэширование результатов

## Тестирование

Модуль готов к тестированию с реальными изображениями после установки зависимостей и реализации алгоритмов обработки.

## Поддержка

Все функции логируют свои действия и возвращают исходное изображение без изменений, что позволяет легко интегрировать их в существующие системы.
