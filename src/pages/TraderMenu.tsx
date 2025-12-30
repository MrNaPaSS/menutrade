import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, Gift, ExternalLink, HelpCircle, TrendingUp, Code, Users, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { levels, platformLinks } from '@/data/traderMenu';
import { cn } from '@/lib/utils';

const TraderMenu = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();

  useSwipeBack({
    onSwipeBack: () => navigate('/home'),
    enabled: true
  });

  const handleHomeClick = () => {
    navigate('/home');
  };

  const levelIcons = [
    TrendingUp, // Level 1
    Code, // Level 2
    Users, // Level 3
    Crown // Level 4
  ];

  // Helper component for standard premium action cards
  const ActionCard = ({
    title,
    description,
    icon: Icon,
    onClick,
    colorClass = "primary",
    buttonText,
    index = 0
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
      className="mb-4 sm:mb-6"
    >
      <div
        className="group relative glass-card rounded-2xl p-5 sm:p-6 neon-border cursor-pointer transition-all duration-300 hover:bg-white/5 active:scale-[0.98]"
        onClick={onClick}
      >
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full",
              colorClass === "primary" ? "bg-primary" : "bg-secondary"
            )} />
            <motion.div
              className={cn(
                "relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 backdrop-blur-md",
                colorClass === "primary"
                  ? "bg-primary/15 border-primary/30 group-hover:border-primary/50"
                  : "bg-secondary/15 border-secondary/30 group-hover:border-secondary/50"
              )}
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            >
              <Icon className={cn("w-7 h-7 sm:w-8 sm:h-8", colorClass === "primary" ? "text-primary" : "text-secondary")} />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-wide mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-1">
              {description}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between group/btn border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <span className="font-semibold">{buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

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
              <h2 className="font-display font-bold text-lg sm:text-xl">Меню трейдера</h2>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

            {/* Промокоды */}
            <ActionCard
              title="Промокоды"
              description="Получите бонусы на депозит"
              icon={Gift}
              buttonText="Открыть промокоды"
              onClick={() => navigate('/promo-codes')}
              index={0}
            />

            {/* Сетка уровней доступа 2x2 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              {levels.map((level, index) => {
                const Icon = levelIcons[index];
                const colorClasses = index === 0 ? "text-blue-400 border-blue-500/30" :
                  index === 1 ? "text-primary border-primary/30" :
                    index === 2 ? "text-purple-400 border-purple-500/30" :
                      "text-yellow-400 border-yellow-500/30";

                const bgClasses = index === 0 ? "bg-blue-500/10" :
                  index === 1 ? "bg-primary/10" :
                    index === 2 ? "bg-purple-500/10" :
                      "bg-yellow-500/10";

                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div
                      className="group glass-card rounded-2xl p-4 sm:p-5 neon-border cursor-pointer transition-all duration-300 hover:bg-white/5 active:scale-[0.95] flex flex-col items-center text-center h-full"
                      onClick={() => navigate(`/level/${level.id}`)}
                    >
                      <div className="relative mb-3">
                        <div className={cn("absolute inset-0 blur-lg opacity-20 rounded-full", bgClasses)} />
                        <motion.div
                          className={cn("relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border transition-all duration-300", bgClasses, colorClasses)}
                          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                        >
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </motion.div>
                      </div>
                      <h3 className="font-display font-bold text-sm sm:text-base group-hover:text-primary transition-colors">
                        {level.name}
                      </h3>
                      {index === 0 && <span className="text-[10px] font-bold text-blue-400/80 mt-1 uppercase">Free Access</span>}
                      {index === 3 && <span className="text-[10px] font-bold text-yellow-500/80 mt-1 uppercase">VIP Status</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Дополнительные кнопки */}
            <div className="space-y-4">
              <ActionCard
                title="PocketOptions"
                description="Торгуем Здесь"
                icon={ExternalLink}
                buttonText="Открыть платформу"
                onClick={() => window.open(platformLinks.pocketOptions, '_blank')}
                index={3}
              />

              <ActionCard
                title="BlackMirror ULTRA"
                description="TradingView Индикатор"
                icon={Code}
                buttonText="Открыть индикатор"
                onClick={() => window.open(platformLinks.blackMirrorUltra, '_blank')}
                index={4}
              />

              <ActionCard
                title="FAQ"
                description="Вопросы и ответы"
                icon={HelpCircle}
                buttonText="Открыть FAQ"
                onClick={() => navigate('/faq')}
                colorClass="secondary"
                index={5}
              />
            </div>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-muted-foreground font-mono bg-white/5 py-2 rounded-full border border-white/5 inline-block px-4">
                🐸 Built with 💚 for Академия здравого трейдера
              </p>
            </div>
          </div>
        </main>
      </div>
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default TraderMenu;

