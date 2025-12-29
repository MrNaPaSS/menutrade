import { createContext, useContext, ReactNode } from 'react';
import { useTelegram, TelegramUser, TelegramWebApp } from '@/hooks/useTelegram';

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  isTelegram: boolean;
  userId: string | null;
  isAdmin: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const telegram = useTelegram();

  return (
    <TelegramContext.Provider value={telegram}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegramContext() {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegramContext must be used within a TelegramProvider');
  }
  return context;
}

