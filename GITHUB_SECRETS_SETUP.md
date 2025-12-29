# Настройка GitHub Secrets для деплоя

## Важно: API ключ удалён из кода

API ключ OpenRouter больше не хранится в коде. Для работы приложения нужно настроить GitHub Secrets.

## Настройка для локальной разработки

1. Создайте файл `.env` в корне проекта:
```
VITE_OPENROUTER_API_KEY=ваш_ключ_здесь
```

2. Или используйте скрипт:
```bash
.\create-env.bat
```
или
```bash
node create-env.js
```

## Настройка для GitHub Pages (деплой)

1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/secrets/actions

2. Нажмите **"New repository secret"**

3. Добавьте секрет:
   - **Name**: `VITE_OPENROUTER_API_KEY`
   - **Value**: `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`

4. Нажмите **"Add secret"**

5. После этого workflow автоматически будет использовать этот ключ при сборке

## Проверка

После настройки секрета:
- Перейдите в **Actions**: https://github.com/MrNaPaSS/menutrade/actions
- Запустите workflow вручную или сделайте новый commit
- Проверьте, что сборка прошла успешно

## Безопасность

✅ `.env` файл уже в `.gitignore` - не будет закоммичен
✅ API ключ удалён из всех файлов кода
✅ Для деплоя используется GitHub Secrets
✅ Локально ключ хранится только в `.env` (не в Git)

