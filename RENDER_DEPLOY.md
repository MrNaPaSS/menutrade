# Деплой на Render.com через GitHub

## Шаг 1: Подготовка репозитория

Убедитесь, что:
- ✅ Файл с длинным именем переименован
- ✅ Все изменения закоммичены и запушены в GitHub
- ✅ Репозиторий: https://github.com/MrNaPaSS/menutrade

## Шаг 2: Создать новый Web Service на Render

1. Откройте: https://dashboard.render.com/web/new
2. Нажмите **"Connect account"** или **"New +"** → **"Static Site"**
3. Выберите **"Connect GitHub"** или **"Connect GitLab"**
4. Авторизуйтесь и разрешите доступ к репозиториям

## Шаг 3: Настроить Static Site

1. Выберите репозиторий: **MrNaPaSS/menutrade**
2. Настройки:
   - **Name**: `menutrade` (или любое имя)
   - **Branch**: `main`
   - **Root Directory**: (оставьте пустым)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `Node`

## Шаг 4: Настроить переменные окружения

В разделе **"Environment Variables"** добавьте:

1. **VITE_OPENROUTER_PROXY_URL**
   - Value: `https://long-rice-ed1.kaktotakxm.workers.dev`

2. **VITE_PUBLIC_PATH** (опционально)
   - Value: `/` (для Render обычно корень)

## Шаг 5: Деплой

1. Нажмите **"Create Static Site"**
2. Render автоматически:
   - Клонирует репозиторий
   - Установит зависимости
   - Соберёт проект
   - Задеплоит на CDN

## Шаг 6: Получить URL

После деплоя вы получите URL вида:
```
https://menutrade.onrender.com
```

Или можете настроить кастомный домен.

## Важно для Render:

- ✅ Render автоматически деплоит при каждом push в `main`
- ✅ Build команда: `npm install && npm run build`
- ✅ Publish directory: `dist`
- ✅ Используется Cloudflare Worker прокси (ключ на сервере)

## Проверка

После деплоя:
1. Откройте ваш URL
2. Проверьте работу AI чата
3. Убедитесь, что запросы идут на Cloudflare Worker

