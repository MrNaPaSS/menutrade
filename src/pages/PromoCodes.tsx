import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
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
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Назад</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-lg sm:text-xl">Промокоды</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Используйте промокоды при регистрации для получения бонусов
              </p>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

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

