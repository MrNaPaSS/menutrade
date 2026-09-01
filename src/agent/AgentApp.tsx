import { ChatWindow } from '@/agent/components/chat/ChatWindow';
import { useTelegram } from '@/hooks/useTelegram';

interface AgentAppProps {
  onBack: () => void;
}

/**
 * AI-агент, перенесённый из проекта MrNaPaSS/agent.
 *
 * Открывается окном поверх академии. Заменена только точка входа:
 * экран авторизации агента не нужен - пользователь уже вошёл в академии,
 * данные берём из её контекста Telegram. Кнопка возврата встроена
 * в шапку агента, чтобы не перекрывать его меню истории чатов.
 */
export function AgentApp({ onBack }: AgentAppProps) {
  const { user } = useTelegram();

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
      onClick={onBack}
    >
      <div
        // relative - якорь для панели истории внутри агента
        className="relative flex h-[86dvh] w-full max-w-3xl flex-col overflow-hidden
                   rounded-2xl border border-white/20 bg-background shadow-2xl md:h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <ChatWindow user={user} onBack={onBack} />
      </div>
    </div>
  );
}
