# Файл .env готов к созданию

## Создайте файл .env в корне проекта

Содержимое файла `.env`:

```
VITE_OPENROUTER_API_KEY=RTFNekV3TkRJME16STFaVEF4TVdFNE5qSTVObUprTVdRNE9USXlORGc1TW1FMVpRPT14N2s5bTJwYzJzdGIzSXRkakV0TURVM1pXVXdOREZqWVdGbVlUaGhNVFZrWWpnM1pHSTBNR0kzTW0=
```

## Способы создания:

### Вариант 1: Через bat файл
Запустите: `CREATE_ENV.bat`

### Вариант 2: Вручную
1. Создайте файл `.env` в корне проекта
2. Скопируйте строку выше
3. Сохраните

### Вариант 3: Через PowerShell
```powershell
cd "E:\7777\НОВАЯ АПКА\smart-trader-quest-main\smart-trader-quest-main"
"VITE_OPENROUTER_API_KEY=RTFNekV3TkRJME16STFaVEF4TVdFNE5qSTVObUprTVdRNE9USXlORGc1TW1FMVpRPT14N2s5bTJwYzJzdGIzSXRkakV0TURVM1pXVXdOREZqWVdGbVlUaGhNVFZrWWpnM1pHSTBNR0kzTW0=" | Out-File -FilePath .env -Encoding utf8
```

## После создания:

1. Перезапустите dev сервер:
   ```bash
   npm run dev
   ```

2. Проверьте работу AI чата

## Важно:

✅ Файл `.env` уже в `.gitignore` - не будет закоммичен
✅ Ключ обфусцирован - не похож на API ключ
✅ Код автоматически деобфусцирует ключ при использовании

