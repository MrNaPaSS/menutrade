# Скрипт для копирования обложек книг
$sourceDirs = @(
    "C:\Users\Admin\Desktop\психология трейдинга",
    "C:\Users\Admin\Desktop\трейдингобщее",
    "C:\Users\Admin\Desktop\форекс",
    "C:\Users\Admin\Desktop\опционы",
    "C:\Users\Admin\Desktop\риск мен",
    "C:\Users\Admin\Desktop\прайс екшн",
    "C:\Users\Admin\Desktop\психолог",
    "C:\Users\Admin\Desktop\философ"
)

$destDir = "public\book-covers"

# Создаем папку назначения
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

# Копируем файлы из каждой папки
foreach ($sourceDir in $sourceDirs) {
    if (Test-Path $sourceDir) {
        Get-ChildItem -Path $sourceDir -File | Copy-Item -Destination $destDir -Force
        Write-Host "Copied files from $sourceDir"
    } else {
        Write-Host "Directory not found: $sourceDir"
    }
}

Write-Host "All covers copied to $destDir"
