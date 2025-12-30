import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './ProgressBar';
import { PepeIcon } from './PepeIcon';
import { TelegramAuthStatus } from './TelegramAuthStatus';
import { Menu, Globe, Settings, Home, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface HeaderProps {
  progress: number;
  hideOnScroll?: boolean;
}

export function Header({ progress, hideOnScroll = false }: HeaderProps) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>('ru');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language') || 'ru';
    setLanguage(savedLanguage);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hideOnScroll) return;

    const currentScrollY = latest;

    // Показываем при прокрутке вверх или если прокрутка меньше 50px
    if (currentScrollY < lastScrollY || currentScrollY < 50) {
      setIsVisible(true);
    }
    // Скрываем при прокрутке вниз больше 50px
    else if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setIsVisible(false);
    }

    setLastScrollY(currentScrollY);
  });

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
    // Здесь можно добавить логику смены языка интерфейса
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 glass-card border-b border-border/30 ${hideOnScroll && !isVisible ? 'pointer-events-none' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: hideOnScroll ? (isVisible ? 0 : -100) : 0,
        opacity: hideOnScroll ? (isVisible ? 1 : 0) : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div className="max-w-lg mx-auto px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] sm:pt-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Animated GIF logo */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
          >
            {/* Glow effect behind logo */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <PepeIcon size={56} />
          </motion.div>

          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="font-display font-bold text-xl tracking-wider">
              <span className="neon-text-subtle">NO MONEY</span>
              <span className="text-foreground mx-2">-</span>
              <span className="neon-text-subtle">NO HONEY</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              Академия здравого трейдера
            </p>
            <div className="mt-1">
              <TelegramAuthStatus />
            </div>
          </motion.div>

          {/* Menu button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-primary/10 border border-border/30"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card neon-border">
              <DropdownMenuLabel>Меню</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate('/home')} className="cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Профиль пользователя
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Язык интерфейса
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={language} onValueChange={handleLanguageChange}>
                <DropdownMenuRadioItem value="ru">
                  Русский
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">
                  English
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Настройки
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ProgressBar progress={progress} />
        </motion.div>
      </div>
    </motion.header>
  );
}
