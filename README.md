# MosArchive Intelligent Indexing

Веб-сервис с применением средств искусственного интеллекта для автоматизированного извлечения данных из образов архивных документов, их индексирования и наполнения базы данных.

**Кроссплатформенное решение** - поддерживается работа на Windows и Linux.

<div align="center">
  <img src="resources/screen1.png" alt="Screenshot 1" width="45%" style="margin-right: 2%;">
  <img src="resources/screen2.png" alt="Screenshot 2" width="45%">
</div>

## Технологии

- **Frontend**: React 19 + TypeScript
- **Backend**: Python + FastAPI
- **Сборщик**: Vite
- **Стили**: Tailwind CSS
- **Иконки**: Lucide React
- **Пакетный менеджер**: Bun

В соответствии с требованиями информационной безопасности, система разработана для работы **в закрытом контуре без доступа к интернету**.

## Быстрый старт

### Установка Bun

```bash
# Windows (PowerShell)
irm bun.sh/install.ps1 | iex

# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

### Установка зависимостей

1. **Frontend зависимости:**
```bash
bun upgrade
bun update
bun install
```

2. **Backend зависимости (Python 3.8+):**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Запуск приложения

1. **Backend API:**
```bash
python start_backend_full.py
```

2. **Frontend (в другом терминале):**
```bash
bunx vite
```

3. Откройте `http://localhost:5173`

## Документация

```
documentation/
├── INSTALLATION.md          # Подробные инструкции по установке
├── ARCHITECTURE.md          # Архитектура системы
├── COMPONENTS.md            # Компоненты
├── DEVELOPMENT.md           # Разработка
├── DOCKER.md               # Docker-инфраструктура
├── UI_ARCHITECTURE.md      # UI-архитектура
├── frontend/               # Frontend модули
└── backend/                # Backend модули
```

### Основные разделы
- [Установка и запуск](documentation/INSTALLATION.md)
- [Архитектура системы](documentation/ARCHITECTURE.md)
- [Компоненты](documentation/COMPONENTS.md)
- [Разработка](documentation/DEVELOPMENT.md)
- [Docker-инфраструктура](documentation/DOCKER.md)
- [UI-архитектура](documentation/UI_ARCHITECTURE.md)

### Frontend модули
- [Обработка изображений](documentation/frontend/README_image_processing.md)
- [Атрибутивное распознавание](documentation/frontend/README_attribute_recognition.md)
- [Верификация результатов](documentation/frontend/README_verification_module.md)
- [Компонент статистики](documentation/frontend/README_statistics_component.md)
- [Система авторизации](documentation/frontend/README_auth.md)
- [Конструктор отчетов](documentation/frontend/README_report_constructor.md)

### Backend модули
- [Backend API](documentation/backend/README.md)
- [Модуль заглушек](documentation/backend/README_placeholders.md)