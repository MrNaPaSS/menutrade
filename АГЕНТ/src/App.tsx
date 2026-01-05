import { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { TelegramAuthScreen } from '@/components/TelegramAuthScreen';
import { useTelegramApp } from '@/hooks/useTelegramApp';

export default function App() {
    const { isReady, isTelegram, user } = useTelegramApp();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Даём время на инициализацию Telegram SDK
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // В режиме разработки проверяем дебаг флаг
    const isDev = import.meta.env.DEV;
    const hasDevBypass = isDev && localStorage.getItem('dev_bypass') === 'true';

    // Показываем экран загрузки/авторизации
    if (isLoading || !isReady) {
        return <TelegramAuthScreen isLoading={true} isTelegram={true} />;
    }

    // Если не в Telegram и нет dev bypass - показываем заглушку
    if (!isTelegram && !hasDevBypass) {
        return <TelegramAuthScreen isLoading={false} isTelegram={false} />;
    }

    // Если в Telegram но нет пользователя
    if (isTelegram && !user && !hasDevBypass) {
        return <TelegramAuthScreen isLoading={false} isTelegram={false} />;
    }

    // Всё ОК - показываем приложение
    return (
        <div className="fixed inset-0 flex flex-col bg-background">
            <ChatWindow />
        </div>
    );
}
