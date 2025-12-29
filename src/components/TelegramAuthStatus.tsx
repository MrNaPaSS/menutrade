import { useTelegramContext } from '@/contexts/TelegramContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function TelegramAuthStatus() {
  const { user, isReady, isTelegram, isAdmin } = useTelegramContext();

  if (!isReady) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Инициализация...</span>
      </motion.div>
    );
  }

  if (!isTelegram) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <XCircle className="w-3 h-3 text-yellow-500" />
        <span>Не в Telegram</span>
      </motion.div>
    );
  }

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs"
      >
        <CheckCircle2 className="w-3 h-3 text-primary" />
        <span className="text-primary">
          {user.first_name} {user.last_name || ''}
          {isAdmin && <span className="ml-1 text-yellow-400">(Admin)</span>}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-xs text-muted-foreground"
    >
      <XCircle className="w-3 h-3 text-yellow-500" />
      <span>Не авторизован</span>
    </motion.div>
  );
}

