import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoftwareDrawer } from '@/components/SoftwareDrawer';
import { BADGE_LABEL, softwareItems, type SoftwareItem } from '@/data/software';
import { cn } from '@/lib/utils';

const Software = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SoftwareItem | null>(null);

  const handleHomeClick = () => {
    navigate('/home');
  };

  // Хук для свайпа назад
  useSwipeBack({ 
    onSwipeBack: handleHomeClick,
    enabled: true
  });


  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        {/* Header с кнопкой назад */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4">
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-lg sm:text-xl">Наш софт</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Расширение, индикатор, платформа и веб-приложение
              </p>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

            {/* Список, а не четыре простыни подряд: подробности по
                каждому продукту приходят в карточке по нажатию */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden
                         divide-y divide-white/[0.06]"
            >
              {softwareItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group w-full text-left flex items-center gap-3 px-4 py-3.5 min-h-[64px]
                             transition-colors duration-200 hover:bg-white/[0.04] active:bg-white/[0.07]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
                >
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-display font-semibold text-sm tracking-wide truncate
                                       transition-colors duration-200 group-hover:text-primary">
                        {item.name}
                      </span>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0',
                        item.badge === 'free' && 'bg-primary/10 text-primary border-primary/25',
                        item.badge === 'pro' && 'bg-amber-500/10 text-amber-400 border-amber-500/25',
                        item.badge === 'crypto' && 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                      )}>
                        {BADGE_LABEL[item.badge]}
                      </span>
                    </span>
                    <span className="block text-xs text-muted-foreground truncate mt-0.5">
                      {item.kind} · {item.summary}
                    </span>
                  </span>

                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0
                                           transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              ))}
            </motion.div>
          </div>
        </main>
      </div>

      <SoftwareDrawer item={selected} onOpenChange={(open) => !open && setSelected(null)} />
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default Software;
