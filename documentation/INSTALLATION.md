# Установка и запуск

## Предварительные требования

- **Python 3.8+** (рекомендуется 3.9+)
- **Bun** (пакетный менеджер для JavaScript/TypeScript)
- **pip** (менеджер пакетов Python)

## Установка Bun

### Windows (PowerShell)
```bash
irm bun.sh/install.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://bun.sh/install | bash
```

### Проверка установки
```bash
bun --version
```

## Установка зависимостей

1. Перейдите в директорию проекта:
```bash
cd mosarchive-intelligent-indexing
```

2. **Frontend зависимости:**
```bash
bun upgrade
bun update
bun install
```

3. **Backend зависимости:**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Запуск серверов

### 1. Backend API (полный функционал)
```bash
python start_backend_full.py
```

### 2. Frontend (в другом терминале)
```bash
bunx vite
```

### Альтернативные способы запуска frontend
```bash
# Запуск с указанием порта
bunx vite --port 5173

# Запуск в режиме preview (для тестирования сборки)
bun run preview

# Альтернативный способ через bun run
bun run dev
```

## Доступ к приложению

После запуска серверов откройте браузер и перейдите по адресу:
- `http://localhost:5173` (frontend - фиксированный порт)
- `http://localhost:8000` (backend API)
- `http://localhost:8000/docs` (документация API)

## Настройка портов

Порты настроены в `vite.config.ts`:
- **5173** - порт для разработки (dev server)
- **4173** - порт для preview режима
- **8000** - порт backend API

> Если порт 5173 занят, Vite автоматически выберет следующий доступный порт (5174, 5175, и т.д.).

## Решение проблем с портами

**Если порт 5173 занят:**
```bash
# Остановить все процессы Node.js
taskkill /f /im node.exe

# Или найти и остановить конкретный процесс
netstat -ano | findstr :5173
taskkill /f /pid <PID>
```

**Принудительный запуск на конкретном порту:**
```bash
bunx vite --port 5173 --force
```

## Сборка для продакшена

```bash
# Сборка проекта
bun run build

# Предварительный просмотр сборки
bun run preview
```

Собранные файлы будут в папке `dist/`.
