import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, Gift, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { promoCodes } from '@/data/traderMenu';
import { useState } from 'react';

const PromoCodes = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
                onClick={() => navigate('/trader-menu')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">Назад</span>
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl mb-2">Промокоды</h2>
              <p className="text-sm text-muted-foreground">
                Используйте промокоды при регистрации для получения бонусов
              </p>
            </div>

            <div className="space-y-4">
              {promoCodes.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="glass-card rounded-xl p-6 neon-border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                          <Gift className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-xl">{promo.code}</h3>
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              {promo.bonus}
                            </Badge>
                          </div>
                          {promo.description && (
                            <p className="text-xs text-muted-foreground">{promo.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <span className="text-sm text-muted-foreground">Минимальный депозит:</span>
                        <span className="text-sm font-semibold">{promo.minDeposit}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCopyCode(promo.code)}
                      >
                        {copiedCode === promo.code ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Скопировано
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Копировать код
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => window.open(promo.registrationUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Зарегистрироваться
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
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

export default PromoCodes;

