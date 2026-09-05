import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Home, Settings, User } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { cn } from '@/lib/utils';

interface MenuModalProps {
    open: boolean;
    onClose: () => void;
    /** Профиль открывается своим окном, а не пунктом внутри этого */
    onOpenProfile: () => void;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

const LANGUAGES: Array<[string, string]> = [
    ['ru', 'Русский'],
    ['en', 'English'],
];

/**
 * Меню окном.
 *
 * Выпадающий список от кнопки был единственным местом в приложении,
 * которое раскрывалось по-своему: всё остальное - обучение, стратегии,
 * софт, профиль - открывается окном. Одинаковое движение важнее
 * разнообразия.
 */
export function MenuModal({ open, onClose, onOpenProfile }: MenuModalProps) {
    const navigate = useNavigate();
    const [language, setLanguage] = useState('ru');

    useEffect(() => {
        setLanguage(localStorage.getItem('app_language') || 'ru');
    }, [open]);

    const changeLanguage = useCallback((lang: string) => {
        setLanguage(lang);
        localStorage.setItem('app_language', lang);
    }, []);

    // Переход закрывает окно: иначе оно останется висеть над новым экраном
    const go = useCallback((path: string) => {
        onClose();
        navigate(path);
    }, [navigate, onClose]);

    return (
        <ModalWindow open={open} onClose={onClose} title="Меню">
            <div className={cn(PANEL, 'divide-y divide-[hsl(142_22%_13%)]')} style={PANEL_BG}>
                <TerminalRow
                    index={0}
                    icon={<Home className="w-[18px] h-[18px]" />}
                    tone="green"
                    title="На главную"
                    caption="Разделы академии и прогресс"
                    onClick={() => go('/home')}
                />
                <TerminalRow
                    index={1}
                    icon={<User className="w-[18px] h-[18px]" />}
                    tone="cyan"
                    title="Профиль"
                    caption="Доступ, регистрация и депозит"
                    onClick={() => {
                        onClose();
                        onOpenProfile();
                    }}
                />
                <TerminalRow
                    index={2}
                    icon={<Settings className="w-[18px] h-[18px]" />}
                    tone="violet"
                    title="Настройки"
                    caption="Уведомления и оформление"
                    onClick={() => go('/settings')}
                />
            </div>

            {/* Язык переключается прямо здесь: ради двух вариантов уводить
                на отдельный экран незачем */}
            <div className={cn(PANEL, 'p-3.5')} style={PANEL_BG}>
                <div className="flex items-center gap-2 mb-2.5">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">Язык интерфейса</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map(([code, label]) => {
                        const active = language === code;
                        return (
                            <button
                                key={code}
                                onClick={() => changeLanguage(code)}
                                className={cn(
                                    'h-10 rounded-xl text-[13.5px] font-medium transition-colors',
                                    'border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                    active
                                        ? 'bg-primary/12 border-primary/35 text-primary'
                                        : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground hover:bg-white/[0.06]'
                                )}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </ModalWindow>
    );
}
