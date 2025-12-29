import { motion } from 'framer-motion';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { useTelegramContext } from '@/contexts/TelegramContext';
import { Button } from '@/components/ui/button';
import { MatrixRain } from './MatrixRain';

export function TelegramAuthScreen() {
  const { isReady, isTelegram, user, webApp } = useTelegramContext();

  // Если не в Telegram - показываем инструкцию
  if (isReady && !isTelegram) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background scanline">
        <MatrixRain />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md mx-auto p-8 glass-card rounded-2xl neon-border text-center"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <AlertCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2">Требуется авторизация</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Это приложение доступно только через Telegram
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 text-left">
              <h3 className="font-semibold text-sm mb-2">Как открыть приложение:</h3>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Откройте Telegram на вашем устройстве</li>
                <li>Найдите бота @moneyhoney7_bot</li>
                <li>Нажмите на кнопку "Открыть приложение" или используйте команду /start</li>
                <li>Приложение откроется автоматически</li>
              </ol>
            </div>

            <Button
              onClick={() => window.open('https://t.me/moneyhoney7_bot', '_blank')}
              className="w-full"
            >
              Открыть в Telegram
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Если еще загружается
  if (!isReady) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background scanline">
        <MatrixRain />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30"
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="font-display font-bold text-xl mb-2">Инициализация Telegram...</h2>
          <p className="text-sm text-muted-foreground">
            Проверка авторизации
          </p>
        </motion.div>
      </div>
    );
  }

  // Если в Telegram, но пользователь не авторизован
  if (isTelegram && !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background scanline">
        <MatrixRain />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md mx-auto p-8 glass-card rounded-2xl neon-border text-center"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
              <Shield className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2">Авторизация не завершена</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Не удалось получить данные пользователя из Telegram
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 text-left">
              <h3 className="font-semibold text-sm mb-2">Возможные причины:</h3>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>Приложение открыто не через Telegram</li>
                <li>Проблемы с подключением к Telegram</li>
                <li>Устаревшая версия Telegram</li>
              </ul>
            </div>

            <Button
              onClick={() => {
                if (webApp) {
                  webApp.close();
                } else {
                  window.location.reload();
                }
              }}
              variant="outline"
              className="w-full"
            >
              Закрыть и открыть заново
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Если все ОК - не показываем ничего (приложение загрузится)
  return null;
}

