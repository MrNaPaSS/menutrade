import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { levels } from '@/data/traderMenu';

const Level4 = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();
  const level = levels[3];

  const handleHomeClick = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-[100dvh] scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <SimpleMenu />
        <main className="p-4 sm:p-5 md:p-6 pb-24 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => navigate('/trader-menu')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Назад</span>
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="glass-card rounded-xl p-6 neon-border mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display font-bold text-2xl">{level.title}</h2>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        ELITE
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 sm:p-5 md:p-6 neon-border mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-muted/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm">👑</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg">Что входит:</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {level.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
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
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">{advantage}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="glass-card rounded-xl p-4 sm:p-5 md:p-6 neon-border">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Для получения доступа к уровню ELITE свяжитесь с менеджером
                </p>
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

export default Level4;

