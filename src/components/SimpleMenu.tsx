import { useState } from 'react';
import { Menu } from 'lucide-react';
import { MenuModal } from '@/components/MenuModal';
import { ProfileModal } from '@/components/ProfileModal';

/**
 * Три полоски на внутренних экранах.
 *
 * Открывают то же окно меню, что и на главной: одна кнопка не может
 * вести себя на разных экранах по-разному.
 */
export function SimpleMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="fixed top-[calc(env(safe-area-inset-top)+var(--tg-content-top,0.5rem))] right-4 z-[60]">
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Меню"
        className="h-8 w-8 flex items-center justify-center text-muted-foreground
                   hover:text-foreground transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
      >
        <Menu className="h-4 w-4" />
      </button>

      <MenuModal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={() => setProfileOpen(true)}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
