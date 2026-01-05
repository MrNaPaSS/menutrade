# ⚡ Настройка Cloudflare Worker (Прокси для API)

Чтобы твой API ключ не украли, мы спрячем его за Cloudflare Worker.

## Шаг 1: Создание Воркера
1. Зайди на [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Перейди в раздел **Workers & Pages**
3. Нажми **Create Worker**
4. Назови его, например: `agent-proxy`
5. Нажми **Deploy** (игнорируй код по умолчанию пока что)

## Шаг 2: Загрузка кода
1. После создания нажми **Edit code**
2. Удали весь код там
3. Скопируй содержимое файла `cloudflare-worker.js` (который я создал в папке АГЕНТ)
4. Вставь его в редактор Cloudflare
5. Нажми **Deploy** еще раз

## Шаг 3: Добавление API Ключа (Секрет)
1. Вернись в настройки воркера (стрелочка назад)
2. Зайди в **Settings** -> **Variables**
3. В разделе **Environment Variables** нажми **Add variable**
4. Имя: `OPENROUTER_API_KEY`
5. Значение: Твой ключ `sk-or-v1-...`
6. Нажми **Encrypt** (обязательно!) и **Save**

Теперь воркер готов! Скопируй его URL (обычно заканчивается на `workers.dev`).

## Шаг 4: Подключение к Приложению
В коде приложения (`src/services/aiService.ts`) нужно поменять адрес API на адрес твоего воркера.

Пример:
Вместо `https://openrouter.ai/api/...` вставляем `https://agent-proxy.твое_имя.workers.dev`
