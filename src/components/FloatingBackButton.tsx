import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingBackButtonProps {
  onClick: () => void;
}

export function FloatingBackButton({ onClick }: FloatingBackButtonProps) {
  const [showBackButton, setShowBackButton] = useState(true);
  const { scrollY } = useScroll();

  // Отслеживание скролла для показа кнопки назад
  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest;
    
    // Показываем кнопку всегда, но делаем её более заметной при скролле
    setShowBackButton(true);
  });

  return (
    <motion.div
      className="fixed left-2 sm:left-3 md:left-4 bottom-28 sm:bottom-32 z-50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: showBackButton ? 1 : 0,
        scale: showBackButton ? 1 : 0
      }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
    >
      <Button
        onClick={onClick}
        className="rounded-full h-12 w-12 sm:h-14 sm:w-14 min-h-[48px] min-w-[48px] glass-card neon-border shadow-lg hover:shadow-xl"
        size="icon"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    </motion.div>
  );
}

