import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { levels } from '@/data/traderMenu';

const Level3 = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();
  const level = levels[2];

  const handleHomeClick = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header progress={progress} />
        
        <main className="p-4 pb-24">
          <div className="max-w-lg mx-auto">
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display font-bold text-2xl">{level.title}</h2>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        MENTOR
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 neon-border mb-6">
                <h3 className="font-display font-bold text-lg mb-4">Что включено:</h3>
                <ul className="space-y-3">
                  {level.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 neon-border">
                <p className="text-sm text-muted-foreground text-center">
                  Для получения доступа к уровню MENTOR свяжитесь с менеджером
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

export default Level3;

