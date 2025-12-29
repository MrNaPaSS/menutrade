import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, Gift, ExternalLink, HelpCircle, TrendingUp, Code, Users, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { levels, platformLinks } from '@/data/traderMenu';

const TraderMenu = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();

  const handleHomeClick = () => {
    navigate('/home');
  };

  const levelIcons = [
    TrendingUp, // Level 1
    Code, // Level 2
    Users, // Level 3
    Crown // Level 4
  ];

  const levelColors = [
    'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400', // Level 1
    'from-primary/20 to-primary/30 border-primary/30 text-primary', // Level 2
    'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400', // Level 3
    'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400' // Level 4
  ];

  return (
    <div className="min-h-screen scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header progress={progress} />
        
        <main className="p-4 pb-24">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">На главную</span>
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl mb-2">Меню трейдера</h2>
              <p className="text-sm text-muted-foreground">
                Выберите уровень доступа или перейдите в нужный раздел
              </p>
            </div>

            {/* Промокоды - верхняя кнопка */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
              className="mb-6"
            >
              <div 
                className="glass-card rounded-xl p-6 neon-border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
                onClick={() => navigate('/promo-codes')}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center border bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20 shadow-[0_0_20px_-5px_hsl(142,76%,52%,0.3)]"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Gift className="w-8 h-8 text-primary" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold tracking-wide mb-1">
                      Промокоды
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Получите бонусы на депозит
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between group"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/promo-codes');
                      }}
                    >
                      <span>Открыть промокоды</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Сетка уровней доступа 2x2 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {levels.map((level, index) => {
                const Icon = levelIcons[index];
                const getColorClasses = (index: number) => {
                  switch (index) {
                    case 0:
                      return {
                        bg: 'bg-gradient-to-br from-blue-500/15 to-blue-600/25 border-blue-500/20',
                        icon: 'text-blue-400'
                      };
                    case 1:
                      return {
                        bg: 'bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20',
                        icon: 'text-primary'
                      };
                    case 2:
                      return {
                        bg: 'bg-gradient-to-br from-purple-500/15 to-purple-600/25 border-purple-500/20',
                        icon: 'text-purple-400'
                      };
                    case 3:
                      return {
                        bg: 'bg-gradient-to-br from-yellow-500/15 to-yellow-600/25 border-yellow-500/20',
                        icon: 'text-yellow-400'
                      };
                    default:
                      return {
                        bg: 'bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20',
                        icon: 'text-primary'
                      };
                  }
                };
                const colorClasses = getColorClasses(index);
                
                // Для Level 1 и Level 2 открываем ссылку "посмотреть в действии", для остальных - страницу уровня
                const handleLevelClick = () => {
                  if (level.id === 1 || level.id === 2) {
                    // Находим первую ссылку типа 'link' для "посмотреть в действии"
                    const viewLink = level.actions.find(action => action.type === 'link');
                    if (viewLink) {
                      window.open(viewLink.url, '_blank');
                    } else {
                      navigate(`/level/${level.id}`);
                    }
                  } else {
                    navigate(`/level/${level.id}`);
                  }
                };
                
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div
                      className="glass-card rounded-xl p-4 neon-border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
                      onClick={handleLevelClick}
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div 
                          className={`relative w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses.bg} shadow-[0_0_20px_-5px_hsl(142,76%,52%,0.3)] mb-3`}
                          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                        </motion.div>
                        <h3 className="font-display font-bold text-base mb-1">
                          {level.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {level.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Дополнительные кнопки */}
            <div className="space-y-4 mb-6">
              {/* PocketOptions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 25 }}
              >
                <div 
                  className="glass-card rounded-xl p-6 neon-border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
                  onClick={() => window.open(platformLinks.pocketOptions, '_blank')}
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center border bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20 shadow-[0_0_20px_-5px_hsl(142,76%,52%,0.3)]"
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ExternalLink className="w-8 h-8 text-primary" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold tracking-wide mb-1">
                        PocketOptions
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Торгуем Здесь
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between group"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(platformLinks.pocketOptions, '_blank');
                        }}
                      >
                        <span>Открыть платформу</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* BlackMirror ULTRA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 25 }}
              >
                <div 
                  className="glass-card rounded-xl p-6 neon-border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
                  onClick={() => window.open(platformLinks.blackMirrorUltra, '_blank')}
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center border bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20 shadow-[0_0_20px_-5px_hsl(142,76%,52%,0.3)]"
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Code className="w-8 h-8 text-primary" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold tracking-wide mb-1">
                        BlackMirror ULTRA
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        TradingView
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between group"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(platformLinks.blackMirrorUltra, '_blank');
                        }}
                      >
                        <span>Открыть индикатор</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* FAQ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 25 }}
              >
                <div 
                  className="glass-card rounded-xl p-6 neon-border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
                  onClick={() => navigate('/faq')}
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center border bg-gradient-to-br from-secondary/15 to-secondary/25 border-secondary/20 shadow-[0_0_20px_-5px_hsl(142,76%,52%,0.3)]"
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HelpCircle className="w-8 h-8 text-secondary" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold tracking-wide mb-1">
                        FAQ
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Вопросы/Ответы
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between group"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/faq');
                        }}
                      >
                        <span>Открыть FAQ</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

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

export default TraderMenu;

