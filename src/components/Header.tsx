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
import { ProfileModal } from '@/components/ProfileModal';
import { cn } from '@/lib/utils';

const basePath = () => import.meta.env.BASE_URL || '/';

// Фон один в один с нижней панелью: фото и меню сверху читаются как та
// же поверхность, что и навигация снизу
const PANEL = 'bg-background/60 backdrop-blur-2xl border border-border/30';

/**
 * Шапка главной.
 *
 * Сверху графити во всю ширину - это лицо академии, поэтому оно стоит
 * первым и крупно. Ниже одной строкой: фото человека слева, название
 * посередине, меню справа. Так шапка занимает две полосы вместо трёх
 * и главная помещается на экран.
 *
 * Верхний отступ считает и системную строку, и полосу кнопок Telegram
 * (--tg-content-top) - иначе логотип уезжает под «Закрыть» и «...».
 */
export function Header() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const reduced = useReducedMotion();
  const [language, setLanguage] = useState('ru');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setLanguage(localStorage.getItem('app_language') || 'ru');
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const initial = user?.first_name?.[0]?.toUpperCase() ?? 'Т';

  return (
    <header
      className="max-w-lg mx-auto px-4"
      /* Полосу кнопок Telegram не обходим совсем: графити встаёт прямо
         в её пустую середину, между «Закрыть» и «...». Картинка выше
         полосы, поэтому строка под ней всё равно начинается ниже
         кнопок и ничего не перекрывает */
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <motion.img
        src={`${basePath()}nmnh_graffiti.png`}
        alt="NO MONEY - NO HONEY"
        className="block mx-auto w-[min(132px,36vw)] h-auto object-contain select-none"
        draggable={false}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }}
      />

      <motion.div
        className="flex items-center justify-between gap-2 mt-1"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
      >
        <button
          onClick={() => setProfileOpen(true)}
          aria-label="Профиль"
          className={cn(
            'w-10 h-10 rounded-full flex-shrink-0 p-[3px]',
            'flex items-center justify-center overflow-hidden',
            'transition-colors duration-200 hover:border-border/60',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            PANEL
          )}
        >
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="font-display font-bold text-primary text-sm">{initial}</span>
          )}
        </button>

        <div className="flex flex-col items-center min-w-0">
          <h1 className="font-display font-bold whitespace-nowrap tracking-wide
                         text-[clamp(0.8rem,3.9vw,1.05rem)]">
            <span className="neon-text-subtle">NO MONEY</span>
            <span className="text-foreground mx-1">-</span>
            <span className="neon-text-subtle">NO HONEY</span>
          </h1>
          <p className="text-[10.5px] text-muted-foreground tracking-wide truncate max-w-full">
            Академия здравого трейдера
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id="header-menu-button"
              variant="ghost"
              size="icon"
              className={cn('h-10 w-10 flex-shrink-0 rounded-full hover:border-border/60', PANEL)}
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

            <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
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
      </motion.div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
