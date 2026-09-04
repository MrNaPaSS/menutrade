import { ChatWindow } from '@/agent/components/chat/ChatWindow';
import { ModalWindow } from '@/components/ui/modal-window';
import { useTelegram } from '@/hooks/useTelegram';

interface AgentAppProps {
  onBack: () => void;
}

/**
 * AI-агент, перенесённый из проекта MrNaPaSS/agent.
 *
 * Открывается тем же окном, что и остальные разделы: подложка гасит
 * фон размытием, окно вырастает из середины, Escape и нажатие мимо
 * закрывают. Раньше у агента была своя обвязка - другая подложка,
 * другие скругления, другое движение, - и он выбивался из приложения.
 *
 * Своя шапка у агента остаётся: в ней выбор режима и рынка и история
 * чатов. Две шапки подряд читались бы как ошибка вёрстки.
 */
export function AgentApp({ onBack }: AgentAppProps) {
  const { user } = useTelegram();

  return (
    <ModalWindow
      open
      onClose={onBack}
      title="AI-агент"
      hideHeader
      wide
      bare
      noScroll
    >
      <ChatWindow user={user} onBack={onBack} />
    </ModalWindow>
  );
}
