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
    <div className="fixed top-2 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10 rounded-lg hover:bg-primary/10 bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out active:scale-95"
          >
            <Menu className="h-5 w-5 transition-transform duration-300" />
          </Button>
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

