# Инструкция по деплою на GitHub Pages

## Предварительные требования

1. Аккаунт на GitHub
2. Git установлен локально
3. Node.js 20+ и npm установлены
4. Репозиторий создан на GitHub: `https://github.com/MrNaPaSS/menutrade`

## Быстрый старт (Windows PowerShell)

```powershell
# Запустите скрипт инициализации
.\deploy-init.ps1
```

Скрипт автоматически:
- Инициализирует Git репозиторий
- Настроит remote на `https://github.com/MrNaPaSS/menutrade.git`
- Создаст коммит и отправит код на GitHub

## Ручная настройка

### 1. Инициализация локального репозитория

```bash
# Инициализация git репозитория
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: Smart Trader Quest application"

# Добавление remote репозитория
git remote add origin https://github.com/MrNaPaSS/menutrade.git

# Переименование основной ветки в main
git branch -M main

# Отправка кода на GitHub
git push -u origin main
```

**Если репозиторий на GitHub не пустой:**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 2. Настройка GitHub Pages

1. Перейдите на https://github.com/MrNaPaSS/menutrade/settings/pages
2. В разделе "Source" выберите:
   - **Source**: `GitHub Actions`
3. Сохраните изменения

### 3. Автоматический деплой

После настройки GitHub Pages, при каждом push в ветку `main` будет автоматически запускаться workflow, который:
1. Устанавливает зависимости (`npm ci`)
2. Собирает проект (`npm run build`)
3. Деплоит на GitHub Pages

**Сайт будет доступен по адресу:**
`https://MrNaPaSS.github.io/menutrade/`

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev
# Приложение доступно на http://localhost:8080

# Сборка для production
npm run build

# Предпросмотр production сборки
npm run preview
```

## Конфигурация

### Base Path

В `vite.config.ts` установлен base path `/menutrade/` для корректной работы на GitHub Pages.

Для локальной разработки можно использовать:
```bash
VITE_PUBLIC_PATH=/ npm run dev
```

### GitHub Actions Workflow

Workflow файл находится в `.github/workflows/deploy.yml` и автоматически:
- Запускается при push в `main`
- Использует Node.js 20
- Собирает проект с правильным base path
- Деплоит на GitHub Pages

## Важные замечания

1. ✅ Base path настроен в `vite.config.ts` как `/menutrade/`
2. ✅ Workflow настроен для автоматического деплоя
3. ✅ Все изменения должны быть закоммичены и запушены в ветку `main` для автоматического деплоя
4. ⚠️ После первого деплоя может потребоваться несколько минут для активации сайта

## Проверка деплоя

1. Перейдите в раздел **Actions** репозитория на GitHub
2. Проверьте статус workflow "Deploy to GitHub Pages"
3. После успешного завершения сайт будет доступен по адресу выше

## Troubleshooting

**Сайт не открывается:**
- Проверьте, что в Settings → Pages выбран источник "GitHub Actions"
- Убедитесь, что workflow успешно завершился в разделе Actions
- Подождите 1-2 минуты после первого деплоя

**Ошибки при сборке:**
- Проверьте логи в разделе Actions
- Убедитесь, что все зависимости установлены (`npm install`)
- Проверьте, что Node.js версии 20+ используется

