import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, Home, Menu, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTelegram } from '@/hooks/useTelegram';

const basePath = () => import.meta.env.BASE_URL || '/';

/**
 * Шапка главной.
 *
 * Графити стоит в самой полосе кнопок Telegram - ровно между «Закрыть»
 * слева и «…» справа. Середина этой полосы всегда пустует, и логотип
 * занимает её, ничего не перекрывая и не отнимая высоты у экрана.
 * Поэтому здесь единственное место в приложении, где отступ
 * --tg-content-top намеренно не применяется.
 *
 * Фото человека - в углу под этой полосой, как в любом приложении.
 */
export function Header() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const reduced = useReducedMotion();
  const [language, setLanguage] = useState('ru');

  useEffect(() => {
    setLanguage(localStorage.getItem('app_language') || 'ru');
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const initial = user?.first_name?.[0]?.toUpperCase() ?? 'Т';

  return (
    <header className="relative">
      {/* Логотип в полосе кнопок Telegram: только вертикальный отступ
          системной строки, без --tg-content-top - иначе он опустится
          под кнопки, а не встанет между ними */}
      <div
        className="pointer-events-none absolute inset-x-0 flex justify-center z-[55]"
        style={{ top: 'calc(env(safe-area-inset-top) + 2px)' }}
      >
        <motion.img
          src={`${basePath()}nmnh_logo.png`}
          alt="NO MONEY - NO HONEY"
          className="h-10 w-10 object-contain"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,0.75rem))]">
        <div className="flex items-start justify-between">
          <button
            onClick={() => navigate('/profile')}
            aria-label="Профиль"
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0
                       border border-primary/25 bg-primary/10
                       flex items-center justify-center
                       transition-colors duration-200 hover:border-primary/45
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {user?.photo_url ? (
              <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-primary text-sm">{initial}</span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="header-menu-button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-white/[0.08] hover:bg-white/[0.06]"
              >
                <Menu className="h-[18px] w-[18px]" />
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
                <DropdownMenuRadioItem value="ru">Русский</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
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
          className="flex flex-col items-center -mt-8"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1 className="font-display font-bold whitespace-nowrap text-[clamp(1rem,4.8vw,1.3rem)]
                         tracking-wide">
            <span className="neon-text-subtle">NO MONEY</span>
            <span className="text-foreground mx-1.5">-</span>
            <span className="neon-text-subtle">NO HONEY</span>
          </h1>
          <p className="text-[11.5px] text-muted-foreground tracking-wide mt-0.5">
            Академия здравого трейдера
          </p>
        </motion.div>
      </div>
    </header>
  );
}
