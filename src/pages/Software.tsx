import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, Code, ExternalLink, Sparkles, Shield, Zap, Signal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Software = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();

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
              <h2 className="font-display font-bold text-2xl mb-2">Наш софт</h2>
              <p className="text-sm text-muted-foreground">
                Доступные инструменты и программы для торговли
              </p>
            </div>

            <div className="space-y-6">
              {/* Forex Signals Pro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="glass-card rounded-xl p-6 neon-border">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                      <Signal className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-display font-bold text-xl mb-1">Forex Signals Pro</h3>
                        <p className="text-xs text-muted-foreground mb-2">Веб-приложение</p>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-accent/30">FREE</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Веб-приложение с профессиональными ML моделями для анализа рынка
                    </p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">Доступно после регистрации</p>
                        <p className="text-xs text-muted-foreground">Приложение доступно после регистрации на платформе</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Как получить доступ:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. Зарегистрируйтесь на платформе PocketOptions</p>
                      <p>2. После регистрации получите доступ к приложению</p>
                      <p>3. Используйте профессиональные ML модели для анализа рынка</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-3">
                    <Button
                      variant="outline"
                      className="w-full glass-card rounded-xl p-4 neon-border h-auto justify-start"
                      onClick={() => window.open('https://t.me/NeKnopkaBabl0/a/6', '_blank')}
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Посмотреть в действии
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => window.open('https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Зарегистрироваться
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://t.me/kaktotakxm', '_blank')}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Telegram
                    </Button>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-muted/10 border border-border/30">
                    <p className="text-xs text-muted-foreground text-center">
                      📌 Этот скрипт из закрытого доступа. Обычно такие скрипты предоставляются по месячной оплате, как указано на TradingView.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Black Mirror Predictor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="glass-card rounded-xl p-6 neon-border">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-display font-bold text-xl mb-1">Black Mirror Predictor</h3>
                          <p className="text-xs text-muted-foreground mb-2">TradingView Индикатор</p>
                        </div>
                        <Badge className="bg-accent/20 text-accent border-accent/30">PRO</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Продвинутый индикатор для прогнозирования движения цены на основе алгоритмического анализа рынка
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">Доступ по приглашению</p>
                        <p className="text-xs text-muted-foreground">Скрипт доступен только для одобренных пользователей</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">Обновлено 15 декабря</p>
                        <p className="text-xs text-muted-foreground">Последняя версия с улучшениями</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Как получить доступ:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. Свяжитесь с автором в Telegram: <span className="text-primary font-semibold">@KAKTOTAKXM</span></p>
                      <p>2. Ознакомьтесь с инструкцией по скриптам только по приглашению</p>
                      <p>3. Получите доступ после выполнения условий автора</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-3">
                    <Button
                      variant="outline"
                      className="w-full glass-card rounded-xl p-4 neon-border h-auto justify-start"
                      onClick={() => window.open('https://t.me/NeKnopkaBabl0/a/5', '_blank')}
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Посмотреть в действии
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => window.open('https://ru.tradingview.com/script/3eVmzktt-black-mirror-predictor/', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Открыть на TradingView
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://t.me/kaktotakxm', '_blank')}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Telegram
                    </Button>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-muted/10 border border-border/30">
                    <p className="text-xs text-muted-foreground text-center">
                      📌 Этот скрипт из закрытого доступа. Обычно такие скрипты предоставляются по месячной оплате, как указано на TradingView.
                    </p>
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

export default Software;
