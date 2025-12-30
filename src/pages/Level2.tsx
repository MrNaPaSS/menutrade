import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, Code, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { levels, platformLinks } from '@/data/traderMenu';

const Level2 = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();
  const level = levels[1];

  useSwipeBack({
    onSwipeBack: () => navigate('/trader-menu'),
    enabled: true
  });

  const handleHomeClick = () => {
    navigate('/home');
  };

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
                onClick={() => navigate('/trader-menu')}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Назад</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-lg sm:text-xl">PRO</h2>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              className="mb-6"
            >
              <div className="glass-card rounded-xl p-6 neon-border mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/30 flex items-center justify-center">
                    <Code className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display font-bold text-2xl">{level.title}</h2>
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        PRO
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 sm:p-5 md:p-6 neon-border mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-muted/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm">🔧</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg">Что входит:</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {level.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {level.forWhom && (
                <div className="glass-card rounded-xl p-4 sm:p-5 md:p-6 neon-border mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-muted/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm">🎯</span>
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg">Для кого:</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{level.forWhom}</p>
                </div>
              )}

              {level.advantages && (
                <div className="glass-card rounded-xl p-4 sm:p-5 md:p-6 neon-border mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-muted/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm">💡</span>
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg">Преимущества:</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {level.advantages.map((advantage, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">{advantage}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                {level.actions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full glass-card rounded-xl p-4 sm:p-5 neon-border h-auto min-h-[44px] justify-start text-sm sm:text-base hover:bg-primary/10 hover:border-primary/50 transition-all"
                      onClick={() => window.open(action.url, '_blank')}
                    >
                      {action.type === 'link' ? (
                        <>
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                          <span className="text-foreground">{action.label}</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                          <span className="text-foreground">{action.label}</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground font-mono">
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

export default Level2;

