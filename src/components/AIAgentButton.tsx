import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { AIChatDialog } from './AIChatDialog';
import { useChatHistory } from '@/hooks/useChatHistory';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AIAgentButton() {
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
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: '7rem',
          right: '1rem',
          zIndex: 60
        }}
        className={cn(
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-primary via-primary to-secondary",
          "shadow-[0_0_30px_-5px_hsl(142,76%,52%,0.6)]",
          "flex items-center justify-center",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "transition-all duration-300",
          "relative overflow-visible"
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isOpen ? 0 : 1, 
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: isOpen ? 0 : 1.1, y: isOpen ? 0 : -2 }}
        whileTap={{ scale: isOpen ? 0 : 0.95 }}
      >
        {/* Волны - концентрические круги */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{
              scale: [1, 1.8, 1.8],
              opacity: [0.4, 0.2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: index * 0.7,
              ease: "easeOut"
            }}
            style={{
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
            }}
          />
        ))}

        {/* Пульсирующее свечение */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Внутреннее свечение */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20" />

        {/* Пульсирующая иконка */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Brain className="w-6 h-6 text-primary-foreground relative z-10" strokeWidth={2.5} />
        </motion.div>

        {/* Бейдж с количеством непрочитанных */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge
              variant="destructive"
              className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-bold rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </motion.button>

      <AIChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

