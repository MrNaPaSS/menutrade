# Команды для деплоя

## Шаг 1: Перейти в директорию проекта

```powershell
cd "E:\7777\НОВАЯ АПКА\smart-trader-quest-main\smart-trader-quest-main"
```

## Шаг 2: Проверить изменения

```powershell
git status
```

## Шаг 3: Добавить все изменения

```powershell
git add .
```

## Шаг 4: Создать коммит

```powershell
git commit -m "Add API key obfuscation and security improvements"
```

## Шаг 5: Отправить на GitHub

```powershell
git push origin main
```

## После push:

1. Дождитесь завершения workflow: https://github.com/MrNaPaSS/menutrade/actions
2. Проверьте сайт: https://MrNaPaSS.github.io/menutrade/
3. Проверьте работу AI чата

## Важно:

⚠️ Для продакшена (GitHub Pages) обфусцированный ключ всё равно будет виден в bundle!

Для полной безопасности настройте Cloudflare Worker (см. STEP_BY_STEP_SETUP.md).

Но для проверки работы обфускации можно задеплоить как есть.

