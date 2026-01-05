import { useEffect, useState } from 'react';

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                close: () => void;
                backgroundColor: string;
                themeParams: {
                    bg_color?: string;
                    text_color?: string;
                    hint_color?: string;
                    link_color?: string;
                    button_color?: string;
                    button_text_color?: string;
                };
                initDataUnsafe?: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        language_code?: string;
                    };
                };
                MainButton: {
                    text: string;
                    color: string;
                    textColor: string;
                    isVisible: boolean;
                    isActive: boolean;
                    show: () => void;
                    hide: () => void;
                    onClick: (callback: () => void) => void;
                };
                BackButton: {
                    isVisible: boolean;
                    show: () => void;
                    hide: () => void;
                    onClick: (callback: () => void) => void;
                };
                setHeaderColor: (color: string) => void;
                setBackgroundColor: (color: string) => void;
            };
        };
    }
}

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export function useTelegramApp() {
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isTelegram, setIsTelegram] = useState(false);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;

        if (tg) {
            // Инициализация Telegram Mini App
            tg.ready();
            tg.expand();

            // Это Telegram!
            setIsTelegram(true);

            // Установка цветов
            try {
                tg.setHeaderColor('#0a1a0f');
                tg.setBackgroundColor('#0a1a0f');
            } catch (e) {
                console.log('Could not set colors:', e);
            }

            // Получение данных пользователя
            const userData = tg.initDataUnsafe?.user;
            if (userData) {
                setUser(userData);
            }

            // Применение темы Telegram
            if (tg.themeParams.bg_color) {
                document.documentElement.style.setProperty(
                    '--tg-theme-bg-color',
                    tg.themeParams.bg_color
                );
            }
            if (tg.themeParams.text_color) {
                document.documentElement.style.setProperty(
                    '--tg-theme-text-color',
                    tg.themeParams.text_color
                );
            }

            // Обновление высоты viewport
            const updateViewport = () => {
                document.documentElement.style.setProperty(
                    '--tg-viewport-height',
                    `${window.innerHeight}px`
                );
            };

            updateViewport();
            window.addEventListener('resize', updateViewport);

            setIsReady(true);

            return () => {
                window.removeEventListener('resize', updateViewport);
            };
        } else {
            // Не в Telegram
            setIsTelegram(false);
            setIsReady(true);
        }
    }, []);

    return {
        user,
        isReady,
        isTelegram,
        tg: window.Telegram?.WebApp,
    };
}
