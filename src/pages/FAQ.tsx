import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, BookOpen, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { faqItems, platformLinks } from '@/data/traderMenu';
import { useState } from 'react';

const FAQ = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const handleHomeClick = () => {
    navigate('/home');
  };

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-[100dvh] scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <SimpleMenu />
        <main className="p-4 sm:p-5 md:p-6 pb-24 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
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

            <div className="mb-4 sm:mb-6">
              <h2 className="font-display font-bold text-xl sm:text-2xl mb-1 sm:mb-2">FAQ</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Часто задаваемые вопросы и ответы
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="glass-card rounded-xl neon-border overflow-hidden">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-display font-bold text-lg">{item.question}</h3>
                      </div>
                      {openItem === item.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    
                    {openItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <div className="pt-4 border-t border-border/30">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div 
                className="glass-card rounded-xl p-6 neon-border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
                onClick={() => setIsInstructionOpen(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">
                      Инструкция
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Пошаговая инструкция по использованию
                    </p>
                  </div>
                </div>
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

      {/* Модальное окно с инструкцией */}
      <Dialog open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
        <DialogContent className="glass-card neon-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-2xl flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              ИНСТРУКЦИЯ
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Пошаговая инструкция по регистрации и получению доступа
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Шаг 1 */}
            <div className="glass-card rounded-xl p-4 neon-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Начните сейчас!</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Нажмите на кнопку ниже и пройдите быструю регистрацию на платформе:
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => window.open('https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    РЕГИСТРАЦИЯ НА ПЛАТФОРМЕ
                  </Button>
                </div>
              </div>
            </div>

            {/* Шаг 2 */}
            <div className="glass-card rounded-xl p-4 neon-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Активируйте бонус!</h4>
                  <p className="text-sm text-muted-foreground">
                    Пополните счет минимум на $50.
                  </p>
                </div>
              </div>
            </div>

            {/* Шаг 3 */}
            <div className="glass-card rounded-xl p-4 neon-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Получите доступ!</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Отправьте ваш ID аккаунта PocketOption в бот
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://t.me/moneyhoney7_bot', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Открыть бот @moneyhoney7_bot
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/10 border border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Важно: Откройте новый аккаунт по ссылке выше. Использование существующего аккаунта не даст доступа.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQ;

