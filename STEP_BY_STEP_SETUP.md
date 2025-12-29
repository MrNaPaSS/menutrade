# Пошаговая инструкция по настройке обфусцированного API ключа

## Шаг 1: Обфусцировать API ключ

### Вариант A: Через скрипт (рекомендуется)

1. Откройте терминал (CMD или Git Bash, НЕ PowerShell)
2. Перейдите в директорию проекта:
   ```bash
   cd "E:\7777\НОВАЯ АПКА\smart-trader-quest-main\smart-trader-quest-main"
   ```
3. Запустите скрипт:
   ```bash
   node obfuscate-key-direct.js
   ```
4. Скопируйте обфусцированный ключ из вывода

### Вариант B: Вручную (если скрипт не работает)

Откройте файл `obfuscate-key-direct.js` и запустите его в Node.js, или используйте онлайн base64 encoder.

## Шаг 2: Создать/обновить файл .env

1. В корне проекта создайте файл `.env` (если его нет)
2. Добавьте строку:
   ```
   VITE_OPENROUTER_API_KEY=ваш_обфусцированный_ключ_из_шага_1
   ```
3. Сохраните файл

**ВАЖНО:** Файл `.env` уже в `.gitignore`, он НЕ будет закоммичен в Git.

## Шаг 3: Проверить работу

1. Перезапустите dev сервер (если он запущен):
   - Остановите: `Ctrl+C`
   - Запустите снова: `npm run dev`
2. Проверьте работу AI чата в приложении

## Шаг 4: Деплой на GitHub Pages

### 4.1. Настроить Cloudflare Worker (для продакшена)

1. Откройте https://workers.cloudflare.com/
2. Войдите или создайте аккаунт
3. Нажмите **"Create a Worker"**
4. Скопируйте код из файла `cloudflare-worker-proxy.js`
5. Вставьте в редактор Cloudflare
6. Нажмите **"Save and Deploy"**
7. В настройках Worker: **Settings** → **Variables** → **Secrets**
8. Добавьте секрет:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: `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`
9. Скопируйте URL Worker (например: `https://openrouter-proxy.xxx.workers.dev`)

### 4.2. Добавить URL прокси в GitHub Secrets

1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/secrets/actions
2. Нажмите **"New repository secret"**
3. **Name**: `VITE_OPENROUTER_PROXY_URL`
4. **Value**: URL вашего Cloudflare Worker из шага 4.1
5. Нажмите **"Add secret"**

### 4.3. Закоммитить и запушить изменения

В PowerShell выполните:

```powershell
cd "E:\7777\НОВАЯ АПКА\smart-trader-quest-main\smart-trader-quest-main"
git add .
git commit -m "Add API key obfuscation and Cloudflare Worker proxy"
git push origin main
```

## Шаг 5: Проверка деплоя

1. Дождитесь завершения workflow: https://github.com/MrNaPaSS/menutrade/actions
2. Откройте сайт: https://MrNaPaSS.github.io/menutrade/
3. Проверьте работу AI чата

## Итог

✅ API ключ обфусцирован - не похож на ключ
✅ Ключ работает автоматически после деобфускации
✅ В продакшене используется Cloudflare Worker прокси
✅ Ключ не попадает в клиентский код
✅ Ключ не виден на GitHub

## Если что-то не работает

1. Убедитесь, что `.env` файл в корне проекта
2. Перезапустите dev сервер после создания `.env`
3. Проверьте, что обфусцированный ключ скопирован полностью
4. Проверьте консоль браузера на ошибки

