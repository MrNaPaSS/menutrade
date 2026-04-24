import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, Code, ExternalLink, Sparkles, Shield, Zap, Signal, Eye, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Software = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();

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
                Доступные инструменты и программы для торговли
              </p>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-2.5 sm:p-3 md:p-4 pb-8 sm:pb-10 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Forex Signals Pro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="glass-card rounded-xl p-3 sm:p-4 md:p-6 neon-border">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Signal className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-bold text-base sm:text-lg md:text-xl mb-0.5 sm:mb-1">Forex Signals Pro</h3>
                          <p className="text-xs text-muted-foreground">Веб-приложение</p>
                        </div>
                        <Badge className="bg-accent/20 text-accent border-accent/30 text-xs flex-shrink-0">FREE</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Веб-приложение с профессиональными ML моделями для анализа рынка
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-5 md:mb-6 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 md:p-3 rounded-lg bg-muted/20">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold">Доступно после регистрации</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Приложение доступно после регистрации на платформе</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Как получить доступ:</h4>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <p>1. Зарегистрируйтесь на платформе PocketOptions</p>
                      <p>2. После регистрации получите доступ к приложению</p>
                      <p>3. Используйте профессиональные ML модели для анализа рынка</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-2 sm:mb-3">
                    <Button
                      variant="outline"
                      className="w-full glass-card rounded-xl p-2.5 sm:p-3 md:p-4 neon-border h-auto justify-start min-h-[44px]"
                      onClick={() => window.open('https://t.me/NeKnopkaBabl0/a/6', '_blank')}
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Посмотреть в действии</span>
                    </Button>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      className="flex-1 min-h-[44px] text-xs sm:text-sm"
                      onClick={() => window.open('https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50', '_blank')}
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Зарегистрироваться</span>
                      <span className="sm:hidden">Регистрация</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-[44px] min-w-[44px] px-2 sm:px-4"
                      onClick={() => window.open('https://t.me/kaktotakxm', '_blank')}
                    >
                      <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Telegram</span>
                    </Button>
                  </div>

                  <div className="mt-4 sm:mt-5 md:mt-6 p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/10 border border-border/30">
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
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
                <div className="glass-card rounded-xl p-3 sm:p-4 md:p-6 neon-border">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-bold text-base sm:text-lg md:text-xl mb-0.5 sm:mb-1">Black Mirror Predictor</h3>
                          <p className="text-xs text-muted-foreground">TradingView Индикатор</p>
                        </div>
                        <Badge className="bg-accent/20 text-accent border-accent/30 text-xs flex-shrink-0">PRO</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Продвинутый индикатор для прогнозирования движения цены на основе алгоритмического анализа рынка
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-5 md:mb-6 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 md:p-3 rounded-lg bg-muted/20">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold">Доступ по приглашению</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Скрипт доступен только для одобренных пользователей</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 md:p-3 rounded-lg bg-muted/20">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold">Обновлено 15 декабря</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Последняя версия с улучшениями</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Как получить доступ:</h4>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <p>1. Свяжитесь с автором в Telegram: <span className="text-primary font-semibold">@KAKTOTAKXM</span></p>
                      <p>2. Ознакомьтесь с инструкцией по скриптам только по приглашению</p>
                      <p>3. Получите доступ после выполнения условий автора</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-2 sm:mb-3">
                    <Button
                      variant="outline"
                      className="w-full glass-card rounded-xl p-2.5 sm:p-3 md:p-4 neon-border h-auto justify-start min-h-[44px]"
                      onClick={() => window.open('https://t.me/NeKnopkaBabl0/a/5', '_blank')}
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Посмотреть в действии</span>
                    </Button>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      className="flex-1 min-h-[44px] text-xs sm:text-sm"
                      onClick={() => window.open('https://ru.tradingview.com/script/3eVmzktt-black-mirror-predictor/', '_blank')}
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Открыть на TradingView</span>
                      <span className="sm:hidden">TradingView</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-[44px] min-w-[44px] px-2 sm:px-4"
                      onClick={() => window.open('https://t.me/kaktotakxm', '_blank')}
                    >
                      <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Telegram</span>
                    </Button>
                  </div>

                  <div className="mt-4 sm:mt-5 md:mt-6 p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/10 border border-border/30">
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      📌 Этот скрипт из закрытого доступа. Обычно такие скрипты предоставляются по месячной оплате, как указано на TradingView.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* NMNH Market Assistant */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="glass-card rounded-xl p-3 sm:p-4 md:p-6 neon-border">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-bold text-base sm:text-lg md:text-xl mb-0.5 sm:mb-1">NMNH Market Assistant</h3>
                          <p className="text-xs text-muted-foreground">Chrome Расширение</p>
                        </div>
                        <Badge className="bg-accent/20 text-accent border-accent/30 text-xs flex-shrink-0">FREE</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        ИИ-ассистент прямо внутри платформы. Твой второй мозг за терминалом - видит то же что и ты, думает быстрее.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-5 md:mb-6 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 md:p-3 rounded-lg bg-muted/20">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold">Анализ в реальном времени</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Работает внутри PoTrade без переключений</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 md:p-3 rounded-lg bg-muted/20">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold">Контроль действий</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Пока ты принимаешь решение - он уже проанализировал</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Что он делает:</h4>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <p>🟡 анализирует рынок в реальном времени</p>
                      <p>🟡 контролирует твои действия за терминалом</p>
                      <p>🟡 работает внутри PoTrade без переключений</p>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      className="flex-1 min-h-[44px] text-xs sm:text-sm"
                      onClick={() => window.open('https://chromewebstore.google.com/detail/nmnh-market-assistant/ejecbofgkmnbkfklojagiopfcjnogdhj?authuser=3&hl=ru', '_blank')}
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Установить из Chrome Store</span>
                      <span className="sm:hidden">Установить</span>
                    </Button>
                  </div>

                  <div className="mt-4 sm:mt-5 md:mt-6 p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/10 border border-border/30">
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      📌 Устанавливай прямо сейчас абсолютно бесплатно. Это не бот, который шлёт сигналы, а твой помощник.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">
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
