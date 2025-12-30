import { useNavigate } from 'react-router-dom';
import { Menu, Globe, Settings, Home } from 'lucide-react';
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

export function SimpleMenu() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>('ru');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language') || 'ru';
    setLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  return (
    <div className="fixed top-[calc(env(safe-area-inset-top)+0.5rem)] right-4 z-[60]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-8 w-8 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 p-0 cursor-pointer"
          >
            <Menu className="h-4 w-4 sm:h-4 sm:w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-card neon-border">
          <DropdownMenuLabel>Меню</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate('/home')} className="cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            На главную
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
  );
}

