import { useTelegramContext } from '@/contexts/TelegramContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { validateTelegramData } from '@/utils/telegramValidation';

export function TelegramDebug() {
  const { webApp, user, isReady, isTelegram, userId, isAdmin } = useTelegramContext();
  const [showDebug, setShowDebug] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string } | null>(null);

  // Показываем только в режиме разработки
  if (import.meta.env.PROD) {
    return null;
  }

  const handleTestAuth = () => {
    const testUser = {
      id: 511442168,
      first_name: 'Test',
      last_name: 'Admin',
      username: 'testadmin'
    };
    localStorage.setItem('telegram_test_user', JSON.stringify(testUser));
    window.location.reload();
  };

  const handleLoginAsAdmin = () => {
    // Пользователь с регистрацией и депозитом (ID из info_bot_users.json)
    const adminUser = {
      id: 511442168,
      first_name: 'VIP',
      last_name: 'User',
      username: 'kaktotakxm'
    };
    localStorage.clear(); // Очищаем все данные для чистого теста
    localStorage.setItem('telegram_test_user', JSON.stringify(adminUser));
    localStorage.setItem('admin_bypass', '511442168'); // Обход авторизации
    window.location.reload();
  };

  const handleLoginAsUser = () => {
    // Пользователь без регистрации и депозита (ID из info_bot_users.json)
    const regularUser = {
      id: 8447308589,
      first_name: 'Guest',
      last_name: 'User',
      username: 'Mark'
    };
    localStorage.clear(); // Очищаем все данные для чистого теста
    localStorage.setItem('telegram_test_user', JSON.stringify(regularUser));
    localStorage.setItem('admin_bypass', '8447308589'); // Обход авторизации
    window.location.reload();
  };

  const handleClearTestAuth = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleAdminBypass = () => {
    const confirmBypass = window.confirm(
      'Включить админ-обход авторизации?\n\n⚠️ Это только для разработки!\nВ продакшене это не будет работать.'
    );
    if (confirmBypass) {
      localStorage.setItem('admin_bypass', '511442168');
      window.location.reload();
    }
  };

  const handleValidateData = () => {
    if (webApp) {
      const result = validateTelegramData(webApp.initData, webApp.initDataUnsafe);
      setValidationResult(result);
    } else {
      setValidationResult({ isValid: false, error: 'Telegram WebApp не инициализирован' });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDebug(!showDebug)}
        className="mb-2"
      >
        {showDebug ? 'Скрыть' : 'Показать'} Debug
      </Button>

      {showDebug && (
        <div className="p-4 max-w-xs bg-background/95 backdrop-blur-sm glass-card rounded-xl border border-border/30">
          <div className="space-y-2 text-xs">
            <div>
              <strong>Готов:</strong> {isReady ? '✅' : '❌'}
            </div>
            <div>
              <strong>Telegram:</strong> {isTelegram ? '✅' : '❌'}
            </div>
            <div>
              <strong>Пользователь:</strong> {user ? '✅' : '❌'}
            </div>
            <div>
              <strong>ID:</strong> {userId || 'нет'}
            </div>
            <div>
              <strong>Админ:</strong> {isAdmin ? '✅' : '❌'}
            </div>
            {validationResult && (
              <div className="mt-2 p-2 rounded bg-muted/50">
                <div><strong>Валидация:</strong> {validationResult.isValid ? '✅' : '❌'}</div>
                {validationResult.error && (
                  <div className="text-xs text-red-400 mt-1">{validationResult.error}</div>
                )}
              </div>
            )}
            {user && (
              <div className="mt-2 p-2 bg-muted rounded">
                <div><strong>Имя:</strong> {user.first_name}</div>
                <div><strong>Фамилия:</strong> {user.last_name || 'нет'}</div>
                <div><strong>Username:</strong> {user.username || 'нет'}</div>
              </div>
            )}
            <div className="mt-2 space-y-1">
              <Button size="sm" variant="outline" onClick={handleValidateData} className="w-full text-xs">
                Проверить валидацию
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAdminBypass}
                className="w-full text-xs bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30"
              >
                🔓 Админ-обход авторизации
              </Button>
              <div className="pt-2 border-t border-border/30">
                <div className="text-xs font-bold mb-1 text-muted-foreground">Тестовые пользователи:</div>
                <Button size="sm" variant="outline" onClick={handleLoginAsAdmin} className="w-full text-xs bg-green-500/10 border-green-500/30">
                  ✅ С доступом (ID: 511442168)
                </Button>
                <Button size="sm" variant="outline" onClick={handleLoginAsUser} className="w-full text-xs bg-orange-500/10 border-orange-500/30">
                  ❌ Без доступа (ID: 8447308589)
                </Button>
              </div>
              <Button size="sm" variant="outline" onClick={handleClearTestAuth} className="w-full text-xs bg-red-500/10 border-red-500/30">
                🗑️ Очистить и сбросить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

