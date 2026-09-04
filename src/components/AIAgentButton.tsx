import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Агент со своим чатом, историей и разметкой markdown открывается по
// кнопке. В основном куске ему делать нечего: большинство заходов
// в академию его не открывают вовсе.
const AgentApp = lazy(() => import('@/agent/AgentApp').then(m => ({ default: m.AgentApp })));
import { useChatHistory } from '@/hooks/useChatHistory';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AIAgentButton() {
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { history } = useChatHistory();

  // Отслеживание непрочитанных сообщений (когда диалог закрыт)
  useEffect(() => {
    if (!isOpen && history.length > 0) {
      // Считаем сообщения от AI после последнего сообщения пользователя
      const lastUserIndex = [...history].reverse().findIndex(msg => msg.role === 'user');
      if (lastUserIndex !== -1) {
        const lastUserMessageIndex = history.length - 1 - lastUserIndex;
        const aiMessagesAfter = history.slice(lastUserMessageIndex + 1).filter(msg => msg.role === 'assistant');
        setUnreadCount(aiMessagesAfter.length);
      } else {
        // Если нет сообщений пользователя, считаем все сообщения AI
        const aiMessages = history.filter(msg => msg.role === 'assistant');
        setUnreadCount(aiMessages.length);
      }
    } else {
      setUnreadCount(0);
    }
  }, [isOpen, history]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      <motion.button
        id="ai-agent-trigger"
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
          right: '1rem',
          zIndex: 60
        }}
        className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 rounded-full",
          "bg-gradient-to-br from-primary via-primary to-secondary",
          "shadow-[0_0_30px_-5px_hsl(142,76%,52%,0.6)]",
          "flex items-center justify-center",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "transition-all duration-300",
          "relative overflow-visible",
          "touch-manipulation"
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isOpen ? 0.9 : 1,
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Один мягкий пульс вместо пяти циклов: кнопка на экране постоянно,
            декоративное движение на таком элементе превращается в шум.
            Оставляем ровно столько, чтобы взгляд её находил. */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          animate={reducedMotion ? undefined : {
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.55, 0.35]
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Внутреннее свечение */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20" />

        <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground relative z-10" strokeWidth={2.5} />

        {/* Бейдж с количеством непрочитанных */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.25 }}
            className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1"
          >
            <Badge
              variant="destructive"
              className="h-4 min-w-4 sm:h-5 sm:min-w-5 px-1 sm:px-1.5 flex items-center justify-center text-[10px] sm:text-xs font-bold rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </motion.button>

      {isOpen && (
        <Suspense fallback={null}>
          <AgentApp onBack={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

