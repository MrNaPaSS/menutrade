# Инструкция по инициализации Git репозитория

Выполните следующие команды в терминале в директории проекта:

```bash
# Инициализация git репозитория (если еще не инициализирован)
git init

# Добавление remote репозитория
git remote add origin git@github.com:MrNaPaSS/menutrade.git

# Проверка remote
git remote -v

# Добавление всех файлов
git add .

# Создание первого коммита
git commit -m "Initial commit: Smart Trader Quest application"

# Переименование основной ветки в main (если нужно)
git branch -M main

# Отправка кода на GitHub
git push -u origin main
```

Если репозиторий уже существует на GitHub и содержит файлы, используйте:

```bash
git pull origin main --allow-unrelated-histories
```

Затем повторите push.

