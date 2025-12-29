# Команды для отправки кода на GitHub

Репозиторий настроен. Выполните следующие команды:

```bash
# Проверка статуса
git status

# Просмотр всех файлов готовых к коммиту
git status --short

# Создание коммита (если еще не создан)
git commit -m "Initial commit: Smart Trader Quest application"

# Отправка на GitHub
git push -u origin main
```

Если при push возникнет ошибка о том, что репозиторий не пустой, используйте:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

После успешного push:
1. Перейдите в Settings репозитория на GitHub
2. В разделе Pages выберите Source: GitHub Actions
3. Сайт будет автоматически деплоиться при каждом push в main

