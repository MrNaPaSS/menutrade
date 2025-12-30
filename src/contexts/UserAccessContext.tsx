import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

// Интерфейсы
interface UserAccessState {
    userId: string | null;
    verified: boolean;
    deposited: boolean;
    hasFullAccess: boolean;
    aiMessagesLeft: number;
    isLoading: boolean;
    error: string | null;
}

interface UserAccessContextType extends UserAccessState {
    fetchUserStatus: () => Promise<void>;
    decrementAIMessages: () => void;
    resetAIMessages: () => void;
    checkAccess: (feature: 'ai-chat' | 'learning' | 'strategies') => boolean;
}

// Создаем контекст
const UserAccessContext = createContext<UserAccessContextType | undefined>(undefined);

// Константы
const AI_MESSAGE_LIMIT = 3;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Вспомогательные функции для localStorage
const getStorageKey = (userId: string, key: string) => `user_access_${userId}_${key}`;

const getAIMessageCount = (userId: string): number => {
    if (typeof window === 'undefined') return AI_MESSAGE_LIMIT;
    const stored = localStorage.getItem(getStorageKey(userId, 'ai_messages'));
    return stored ? parseInt(stored, 10) : AI_MESSAGE_LIMIT;
};

const setAIMessageCount = (userId: string, count: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getStorageKey(userId, 'ai_messages'), count.toString());
};

const getCachedStatus = (userId: string) => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(getStorageKey(userId, 'status'));
    if (!cached) return null;

    try {
        const { data, timestamp } = JSON.parse(cached);
        // Проверяем, не истек ли кэш
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    } catch {
        return null;
    }
    return null;
};

const setCachedStatus = (userId: string, data: any) => {
    if (typeof window === 'undefined') return;
    const cacheData = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(getStorageKey(userId, 'status'), JSON.stringify(cacheData));
};

// Provider компонент
export function UserAccessProvider({ children }: { children: React.ReactNode }) {
    const { userId, isReady } = useTelegram();

    const [state, setState] = useState<UserAccessState>({
        userId: null,
        verified: false,
        deposited: false,
        hasFullAccess: false,
        aiMessagesLeft: AI_MESSAGE_LIMIT,
        isLoading: true,
        error: null
    });

    // Функция для получения статуса пользователя с API
    const fetchUserStatus = useCallback(async () => {
        if (!userId) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                verified: false,
                deposited: false,
                hasFullAccess: false,
                aiMessagesLeft: AI_MESSAGE_LIMIT
            }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Проверяем кэш
            const cached = getCachedStatus(userId);
            if (cached) {
                setState(prev => ({
                    ...prev,
                    userId,
                    verified: cached.verified,
                    deposited: cached.deposited,
                    hasFullAccess: cached.hasFullAccess,
                    aiMessagesLeft: getAIMessageCount(userId),
                    isLoading: false
                }));
                return;
            }

            // Production: запрос напрямую к Bot API, минуя статичный /api
            // В DEV используем прокси /bot-api чтобы избежать CORS и ошибок пути
            const startUrl = import.meta.env.DEV ? '/bot-api' : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
            let foundUser = null;

            try {
                const response = await fetch(`${startUrl}/users`);
                if (response.ok) {
                    const textData = await response.text();
                    const allUsers = JSON.parse(textData);
                    if (allUsers[userId]) {
                        foundUser = allUsers[userId];
                    }
                }
            } catch (err) {
                console.error('Failed to fetch from Bot API:', err);
            }

            // Fallback to local file in Dev if API fails
            if (!foundUser && import.meta.env.DEV) {
                try {
                    const response = await fetch('/info_bot_users.json');
                    if (response.ok) {
                        const allUsers = await response.json();
                        if (allUsers[userId]) {
                            foundUser = allUsers[userId];
                        }
                    }
                } catch (e) {
                    console.error('Local fallback failed:', e);
                }
            }

            // Если пользователь не найден нигде, считаем что у него нет доступа (или дефолтный)
            const verified = foundUser?.verified === true;
            const deposited = foundUser?.deposited === true;
            const hasFullAccess = verified && deposited;

            // Сохраняем в кэш
            setCachedStatus(userId, {
                verified,
                deposited,
                hasFullAccess
            });

            setState(prev => ({
                ...prev,
                userId,
                verified,
                deposited,
                hasFullAccess,
                aiMessagesLeft: hasFullAccess ? Infinity : getAIMessageCount(userId),
                isLoading: false
            }));

        } catch (error) {
            console.error('Error fetching user status:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Unknown error',
                isLoading: false,
                verified: false,
                deposited: false,
                hasFullAccess: false,
                aiMessagesLeft: getAIMessageCount(userId)
            }));
        }
    }, [userId]);

    // Загружаем статус при монтировании и изменении userId
    useEffect(() => {
        if (isReady) {
            fetchUserStatus();
        }
    }, [isReady, fetchUserStatus]);

    // Функция для уменьшения счетчика AI сообщений
    const decrementAIMessages = useCallback(() => {
        if (!userId || state.hasFullAccess) return;

        setState(prev => {
            const newCount = Math.max(0, prev.aiMessagesLeft - 1);
            setAIMessageCount(userId, newCount);
            return {
                ...prev,
                aiMessagesLeft: newCount
            };
        });
    }, [userId, state.hasFullAccess]);

    // Функция для сброса счетчика AI сообщений
    const resetAIMessages = useCallback(() => {
        if (!userId) return;

        setAIMessageCount(userId, AI_MESSAGE_LIMIT);
        setState(prev => ({
            ...prev,
            aiMessagesLeft: AI_MESSAGE_LIMIT
        }));
    }, [userId]);

    // Функция для проверки доступа к функции
    const checkAccess = useCallback((feature: 'ai-chat' | 'learning' | 'strategies'): boolean => {
        switch (feature) {
            case 'ai-chat':
                // AI-чат доступен всем, но с ограничениями для пользователей без доступа
                return state.hasFullAccess || state.aiMessagesLeft > 0;

            case 'learning':
            case 'strategies':
                // Обучение и стратегии только для пользователей с полным доступом
                return state.hasFullAccess;

            default:
                return false;
        }
    }, [state.hasFullAccess, state.aiMessagesLeft]);

    const value: UserAccessContextType = {
        ...state,
        fetchUserStatus,
        decrementAIMessages,
        resetAIMessages,
        checkAccess
    };

    return (
        <UserAccessContext.Provider value={value}>
            {children}
        </UserAccessContext.Provider>
    );
}

// Хук для использования контекста
export function useUserAccess() {
    const context = useContext(UserAccessContext);
    if (context === undefined) {
        throw new Error('useUserAccess must be used within a UserAccessProvider');
    }
    return context;
}
