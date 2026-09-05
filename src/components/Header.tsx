import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { MenuModal } from '@/components/MenuModal';
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
  const { user } = useTelegram();
  const reduced = useReducedMotion();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

        <button
          id="header-menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label="Меню"
          className={cn(
            'h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center',
            'text-muted-foreground transition-colors duration-200',
            'hover:text-foreground hover:border-border/60',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            PANEL
          )}
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
      </motion.div>

      <MenuModal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={() => setProfileOpen(true)}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
